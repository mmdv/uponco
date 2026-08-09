<?php

use App\Enums\AppointmentAlert;
use App\Enums\AppointmentChange;
use App\Enums\TeamRole;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Service;
use App\Models\User;
use App\Notifications\Appointments\AppointmentActivity;
use App\Notifications\Appointments\AppointmentBooked;
use App\Notifications\Appointments\AppointmentCancelled;
use App\Support\Appointments\AppointmentCalendar;
use App\Support\Appointments\SlotGenerator;
use Illuminate\Support\Facades\Notification;

test('the appointments page can be rendered', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->get(route('appointments.index'))
        ->assertOk();
});

test('the appointments page still renders after the booked service is deleted', function () {
    $setup = bookableSetup();

    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
    ]);

    // Soft-delete the service and location the appointment was booked against.
    $setup['service']->delete();
    $setup['location']->delete();

    $this
        ->actingAs($setup['user'])
        ->get(route('appointments.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('appointments', 1)
            // The trashed service and location still resolve their original details.
            ->where('appointments.0.service.title', $setup['service']->title)
            ->where('appointments.0.location.name', $setup['location']->name));
});

test('admins see every appointment in the team', function () {
    $setup = bookableSetup();
    $member = User::factory()->create();
    $setup['team']->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($setup['team']);

    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
    ]);
    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $member->id,
    ]);

    $this
        ->actingAs($setup['user'])
        ->get(route('appointments.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('appointments', 2));
});

test('members only see appointments assigned to them', function () {
    $setup = bookableSetup();
    $member = User::factory()->create();
    $setup['team']->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($setup['team']);

    $mine = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $member->id,
    ]);
    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
    ]);

    $this
        ->actingAs($member)
        ->get(route('appointments.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('appointments', 1)
            ->where('appointments.0.id', $mine->id)
        );
});

test('a member cannot cancel an appointment that is not theirs', function () {
    $setup = bookableSetup();
    $member = User::factory()->create();
    $setup['team']->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($setup['team']);

    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
    ]);

    $this
        ->actingAs($member)
        ->patch(route('appointments.cancel', ['appointment' => $appointment->id]))
        ->assertForbidden();

    $this->assertDatabaseHas('appointments', ['id' => $appointment->id, 'status' => 'booked']);
});

test('a member can cancel their own appointment', function () {
    $setup = bookableSetup();
    $member = User::factory()->create();
    $setup['team']->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($setup['team']);

    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $member->id,
    ]);

    $this
        ->actingAs($member)
        ->patch(route('appointments.cancel', ['appointment' => $appointment->id]))
        ->assertRedirect();

    // The row is kept for reporting; only its status changes.
    $this->assertDatabaseHas('appointments', [
        'id' => $appointment->id,
        'status' => 'cancelled',
        'deleted_at' => null,
    ]);
    expect($appointment->fresh()->cancelled_at)->not->toBeNull();
});

test('booking for yourself does not push an alert to your own phone', function () {
    Notification::fake();
    $setup = bookableSetup();

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store'), appointmentPayload($setup))
        ->assertRedirect();

    Notification::assertNotSentTo($setup['user'], AppointmentActivity::class);
});

test('booking on behalf of a colleague pushes an alert to them', function () {
    Notification::fake();
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store'), appointmentPayload($setup, ['specialist_id' => $member->id]))
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    Notification::assertSentTo(
        $member,
        AppointmentActivity::class,
        fn (AppointmentActivity $notification): bool => $notification->alert === AppointmentAlert::Booked,
    );
});

test('rescheduling a colleague\'s appointment pushes an alert to them', function () {
    Notification::fake();
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);
    $start = $setup['startAt']->addDay();

    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $member->id,
        'start_at' => $start,
        'end_at' => $start->addMinutes(60),
    ]);

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.reschedule', ['appointment' => $appointment]), [
            'start_at' => $start->setTime(13, 0)->toIso8601String(),
        ])
        ->assertRedirect();

    Notification::assertSentTo(
        $member,
        AppointmentActivity::class,
        fn (AppointmentActivity $notification): bool => $notification->alert === AppointmentAlert::Rescheduled,
    );
});

test('cancelling a colleague\'s appointment pushes an alert to them', function () {
    Notification::fake();
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);

    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $member->id,
    ]);

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.cancel', ['appointment' => $appointment->id]))
        ->assertRedirect();

    Notification::assertSentTo(
        $member,
        AppointmentActivity::class,
        fn (AppointmentActivity $notification): bool => $notification->alert === AppointmentAlert::Cancelled,
    );
});

test('reassigning an appointment alerts both the old and the new specialist', function () {
    Notification::fake();
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);

    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $member->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $other = teamMemberSpecialist($setup);

    $this
        ->actingAs($setup['user'])
        ->patch(
            route('appointments.update', ['appointment' => $appointment]),
            appointmentPayload($setup, ['specialist_id' => $other->id]),
        )
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    // The specialist losing the appointment is told about the slot they had.
    Notification::assertSentTo(
        $member,
        AppointmentActivity::class,
        fn (AppointmentActivity $notification): bool => $notification->alert === AppointmentAlert::Cancelled,
    );

    Notification::assertSentTo(
        $other,
        AppointmentActivity::class,
        fn (AppointmentActivity $notification): bool => $notification->alert === AppointmentAlert::Booked,
    );
});

test('editing only the notes does not push an alert to the specialist', function () {
    Notification::fake();
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);

    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $member->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $this
        ->actingAs($setup['user'])
        ->patch(
            route('appointments.update', ['appointment' => $appointment]),
            appointmentPayload($setup, ['specialist_id' => $member->id, 'notes' => 'Bring the paperwork.']),
        )
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    Notification::assertNotSentTo($member, AppointmentActivity::class);
});

test('the specialist push payload carries the booking details and a link', function () {
    $setup = bookableSetup();
    $customer = Customer::factory()->for($setup['team'])->create(['name' => 'Jane Doe']);

    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'customer_id' => $customer->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $notification = new AppointmentActivity($appointment, AppointmentAlert::Booked);
    $payload = $notification->toWebPush($setup['user'], $notification)->toArray();

    expect($payload['title'])->toContain($setup['service']->title);
    expect($payload['body'])->toContain('Jane Doe');
    // The team timezone is UTC in this setup, so the seeded 09:00 start shows as 09:00.
    expect($payload['body'])->toContain('09:00');
    expect($payload['data']['url'])->toBe(route('appointments.index'));
    expect($payload['data']['appointment_id'])->toBe($appointment->id);
    expect($payload['tag'])->toBe('appointment-'.$appointment->id);
});

test('the push payload for a reassigned appointment keeps the old slot for the old specialist', function () {
    $setup = bookableSetup();

    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt']->setTime(15, 0),
        'end_at' => $setup['startAt']->setTime(16, 0),
    ]);

    $previousStart = $setup['startAt']->setTime(11, 0);

    $notification = new AppointmentActivity($appointment, AppointmentAlert::Cancelled, $previousStart);
    $payload = $notification->toWebPush($setup['user'], $notification)->toArray();

    expect($payload['body'])->toContain('11:00');
    expect($payload['body'])->not->toContain('15:00');
});

test('a service without a category is still bookable', function () {
    $setup = bookableSetup();
    $setup['service']->update(['service_category_id' => null]);

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store'), appointmentPayload($setup))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('appointments', [
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
    ]);
});

test('the appointments page renders a service without a category', function () {
    $setup = bookableSetup();
    $setup['service']->update(['service_category_id' => null]);

    $this
        ->actingAs($setup['user'])
        ->get(route('appointments.index'))
        ->assertOk();
});

test('an appointment can be created and creates a customer', function () {
    $setup = bookableSetup();

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store'), appointmentPayload($setup))
        ->assertRedirect();

    $this->assertDatabaseHas('customers', [
        'team_id' => $setup['team']->id,
        'email' => 'jane@example.com',
    ]);

    $this->assertDatabaseHas('appointments', [
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'delivery_type' => 'onsite',
        'notes' => 'First visit',
    ]);

    $appointment = Appointment::first();
    expect($appointment->end_at->toIso8601String())
        ->toBe($setup['startAt']->addMinutes(60)->toIso8601String());
});

test('creating an appointment emails the booking details to the customer', function () {
    Notification::fake();
    $setup = bookableSetup();

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store'), appointmentPayload($setup))
        ->assertRedirect();

    Notification::assertSentOnDemand(
        AppointmentBooked::class,
        fn (AppointmentBooked $notification, array $channels, object $notifiable): bool => $notifiable->routeNotificationFor('mail') === 'jane@example.com'
            && $notification->appointment->service_id === $setup['service']->id,
    );
});

test('the booking confirmation email contains the appointment details', function () {
    $setup = bookableSetup();
    $customer = Customer::factory()->for($setup['team'])->create([
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
    ]);
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'customer_id' => $customer->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
        'notes' => 'Please use the side entrance',
    ]);

    $mail = (new AppointmentBooked($appointment))->toMail($customer);

    expect($mail->subject)->toContain($setup['team']->name);
    expect($mail->from)->toBe(['appointment@uponco.com', $setup['team']->name.' via Uponco']);

    $html = (string) $mail->render();
    expect($html)
        ->toContain('Jane Doe')
        ->toContain(e($setup['service']->title))
        ->toContain(e($setup['user']->name))
        ->toContain(e($setup['location']->name))
        ->toContain(e($setup['location']->street_address))
        ->toContain(e($setup['location']->city))
        ->toContain('Please use the side entrance');
});

test('the booking confirmation email attaches a calendar invite', function () {
    $setup = bookableSetup();
    $customer = Customer::factory()->for($setup['team'])->create([
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
    ]);
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'customer_id' => $customer->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $mail = (new AppointmentBooked($appointment))->toMail($customer);

    $attachment = collect($mail->rawAttachments)->firstWhere('name', 'appointment.ics');

    expect($attachment)->not->toBeNull();
    expect($attachment['data'])
        ->toContain('BEGIN:VCALENDAR')
        ->toContain('BEGIN:VEVENT')
        ->toContain('DTSTART:'.$appointment->start_at->copy()->utc()->format('Ymd\THis\Z'))
        ->toContain('DTEND:'.$appointment->end_at->copy()->utc()->format('Ymd\THis\Z'))
        ->toContain($setup['service']->title);
});

test('no confirmation email is sent when the customer only provided a phone', function () {
    Notification::fake();
    $setup = bookableSetup();

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store'), appointmentPayload($setup, [
            'customer_email' => null,
            'customer_phone' => '+1 555 010 2030',
        ]))
        ->assertRedirect();

    Notification::assertNothingSent();
});

test('an appointment reuses an existing customer with the same email', function () {
    $setup = bookableSetup();
    $customer = Customer::factory()->for($setup['team'])->create(['email' => 'jane@example.com']);

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store'), appointmentPayload($setup))
        ->assertRedirect();

    expect(Customer::count())->toBe(1);
    expect(Appointment::first()->customer_id)->toBe($customer->id);
});

test('the slot generator produces available times within work hours', function () {
    $setup = bookableSetup();

    $slots = SlotGenerator::generate(
        $setup['service'],
        $setup['user'],
        $setup['team']->id,
        $setup['team']->timezone,
        $setup['startAt']->format('Y-m-d'),
    );

    expect($slots)->not->toBeEmpty();

    // 09:00 to 17:00 with 60 minute slots and no break yields 8 slots.
    expect($slots)->toHaveCount(8);
    expect($slots[0]['label'])->toBe('09:00');

    $first = collect($slots)->firstWhere('start', $setup['startAt']->toIso8601String());
    expect($first['available'])->toBeTrue();
});

test('the slot generator honours a specialist custom duration', function () {
    $setup = bookableSetup();

    // The service runs 60 minutes, but this specialist delivers it in 120.
    $setup['service']->specialists()->updateExistingPivot($setup['user']->id, [
        'duration' => 120,
    ]);

    $slots = SlotGenerator::generate(
        $setup['service']->fresh(),
        $setup['user'],
        $setup['team']->id,
        $setup['team']->timezone,
        $setup['startAt']->format('Y-m-d'),
    );

    // 09:00 to 17:00 in 120 minute slots yields 4 slots, not 8.
    expect($slots)->toHaveCount(4);
    expect($slots[0]['label'])->toBe('09:00');
    expect($slots[1]['label'])->toBe('11:00');
});

test('a booking uses the specialist custom duration for its end time', function () {
    $setup = bookableSetup();

    $setup['service']->specialists()->updateExistingPivot($setup['user']->id, [
        'duration' => 90,
    ]);

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store'), appointmentPayload($setup))
        ->assertSessionHasNoErrors();

    $appointment = Appointment::first();

    expect($appointment->end_at->equalTo($setup['startAt']->addMinutes(90)))->toBeTrue();
});

test('a date with no schedule slots produces no bookable times', function () {
    $setup = bookableSetup();

    // A day within the booking week has slots; a day far outside it has none.
    $unscheduled = $setup['startAt']->addWeeks(4)->format('Y-m-d');

    $slots = SlotGenerator::generate(
        $setup['service'],
        $setup['user'],
        $setup['team']->id,
        $setup['team']->timezone,
        $unscheduled,
    );

    expect($slots)->toBe([]);
});

test('booking is rejected on a date the specialist has not scheduled', function () {
    $setup = bookableSetup();

    // Same weekday as the scheduled start, but four weeks out where no slot exists.
    $start = $setup['startAt']->addWeeks(4);

    $this
        ->actingAs($setup['user'])
        ->post(
            route('appointments.store'),
            appointmentPayload($setup, ['start_at' => $start->toIso8601String()]),
        )
        ->assertSessionHasErrors('start_at');

    expect(Appointment::count())->toBe(0);
});

test('the slot generator disables already booked times for the specialist', function () {
    $setup = bookableSetup();

    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $slots = SlotGenerator::generate(
        $setup['service'],
        $setup['user'],
        $setup['team']->id,
        $setup['team']->timezone,
        $setup['startAt']->format('Y-m-d'),
    );

    $booked = collect($slots)->firstWhere('start', $setup['startAt']->toIso8601String());
    expect($booked['available'])->toBeFalse();
});

test('a booked slot cannot be double booked for the specialist', function () {
    $setup = bookableSetup();

    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store'), appointmentPayload($setup))
        ->assertSessionHasErrors('start_at');
});

test('a group service slot exposes its full capacity when nothing is booked', function () {
    $setup = bookableSetup(['service_type' => 'group', 'capacity' => 3]);

    $slots = SlotGenerator::generate(
        $setup['service'],
        $setup['user'],
        $setup['team']->id,
        $setup['team']->timezone,
        $setup['startAt']->format('Y-m-d'),
    );

    $slot = collect($slots)->firstWhere('start', $setup['startAt']->toIso8601String());

    expect($slot['remaining'])->toBe(3);
    expect($slot['available'])->toBeTrue();
});

test('each booking in a group session decrements the remaining seats', function () {
    $setup = bookableSetup(['service_type' => 'group', 'capacity' => 3]);

    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $slots = SlotGenerator::generate(
        $setup['service'],
        $setup['user'],
        $setup['team']->id,
        $setup['team']->timezone,
        $setup['startAt']->format('Y-m-d'),
    );

    $slot = collect($slots)->firstWhere('start', $setup['startAt']->toIso8601String());

    expect($slot['remaining'])->toBe(2);
    expect($slot['available'])->toBeTrue();
});

test('a group session becomes unavailable once capacity is reached', function () {
    $setup = bookableSetup(['service_type' => 'group', 'capacity' => 2]);

    Appointment::factory()->count(2)->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $slots = SlotGenerator::generate(
        $setup['service'],
        $setup['user'],
        $setup['team']->id,
        $setup['team']->timezone,
        $setup['startAt']->format('Y-m-d'),
    );

    $slot = collect($slots)->firstWhere('start', $setup['startAt']->toIso8601String());

    expect($slot['remaining'])->toBe(0);
    expect($slot['available'])->toBeFalse();
});

test('a full group session does not block a different session on the same day', function () {
    $setup = bookableSetup(['service_type' => 'group', 'capacity' => 2]);

    Appointment::factory()->count(2)->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $slots = SlotGenerator::generate(
        $setup['service'],
        $setup['user'],
        $setup['team']->id,
        $setup['team']->timezone,
        $setup['startAt']->format('Y-m-d'),
    );

    $laterSession = $setup['startAt']->addHour();
    $slot = collect($slots)->firstWhere('start', $laterSession->toIso8601String());

    expect($slot['remaining'])->toBe(2);
    expect($slot['available'])->toBeTrue();
});

test('an appointment for another service blocks an overlapping group slot', function () {
    $setup = bookableSetup(['service_type' => 'group', 'capacity' => 3]);

    $otherService = Service::factory()
        ->for($setup['service']->category, 'category')
        ->create(['duration' => 60]);

    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $otherService->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $slots = SlotGenerator::generate(
        $setup['service'],
        $setup['user'],
        $setup['team']->id,
        $setup['team']->timezone,
        $setup['startAt']->format('Y-m-d'),
    );

    $slot = collect($slots)->firstWhere('start', $setup['startAt']->toIso8601String());

    // The seats are untouched, but the specialist is busy with the other service.
    expect($slot['remaining'])->toBe(3);
    expect($slot['available'])->toBeFalse();
});

test('individual service slots report a null remaining capacity', function () {
    $setup = bookableSetup(['service_type' => 'individual', 'capacity' => null]);

    $slots = SlotGenerator::generate(
        $setup['service'],
        $setup['user'],
        $setup['team']->id,
        $setup['team']->timezone,
        $setup['startAt']->format('Y-m-d'),
    );

    $slot = collect($slots)->firstWhere('start', $setup['startAt']->toIso8601String());

    expect($slot['remaining'])->toBeNull();
    expect($slot['available'])->toBeTrue();
});

test('an appointment requires a service, specialist and start time', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->post(route('appointments.store'), [
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
        ])
        ->assertSessionHasErrors(['service_id', 'specialist_id', 'start_at']);
});

test('an onsite appointment requires a location', function () {
    $setup = bookableSetup();

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store'), appointmentPayload($setup, [
            'location_id' => null,
        ]))
        ->assertSessionHasErrors('location_id');
});

test('an online appointment can be created without a location', function () {
    $setup = bookableSetup(['delivery_type' => 'online', 'online_meeting_provider' => 'google_meet']);

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store'), appointmentPayload($setup, [
            'location_id' => null,
        ]))
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $this->assertDatabaseHas('appointments', [
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => null,
        'delivery_type' => 'online',
    ]);
});

test('an appointment rejects a specialist who does not provide the service', function () {
    $setup = bookableSetup();
    $other = User::factory()->create();
    $setup['team']->members()->attach($other, ['role' => TeamRole::Member->value]);
    $other->switchTeam($setup['team']);

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store'), appointmentPayload($setup, [
            'specialist_id' => $other->id,
        ]))
        ->assertSessionHasErrors('specialist_id');
});

test('an appointment can be updated', function () {
    $setup = bookableSetup();
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt']->addDay(),
        'end_at' => $setup['startAt']->addDay()->addMinutes(60),
    ]);

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.update', ['appointment' => $appointment]), appointmentPayload($setup, [
            'notes' => 'Updated note',
        ]))
        ->assertRedirect();

    $this->assertDatabaseHas('appointments', [
        'id' => $appointment->id,
        'notes' => 'Updated note',
        'start_at' => $setup['startAt']->toDateTimeString(),
    ]);
});

test('a past appointment cannot be updated', function () {
    $setup = bookableSetup();
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => now()->subDay(),
        'end_at' => now()->subDay()->addMinutes(60),
    ]);

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.update', ['appointment' => $appointment]), appointmentPayload($setup, [
            'notes' => 'Updated note',
        ]))
        ->assertForbidden();

    $this->assertDatabaseMissing('appointments', [
        'id' => $appointment->id,
        'notes' => 'Updated note',
    ]);
});

test('a past appointment cannot be rescheduled', function () {
    $setup = bookableSetup();
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => now()->subDay(),
        'end_at' => now()->subDay()->addMinutes(60),
    ]);

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.reschedule', ['appointment' => $appointment]), [
            'start_at' => $setup['startAt']->toIso8601String(),
        ])
        ->assertForbidden();
});

test('a past appointment cannot be cancelled', function () {
    $setup = bookableSetup();
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => now()->subDay(),
        'end_at' => now()->subDay()->addMinutes(60),
    ]);

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.cancel', ['appointment' => $appointment]))
        ->assertForbidden();

    $this->assertDatabaseHas('appointments', [
        'id' => $appointment->id,
        'status' => 'booked',
    ]);
});

test('updating an appointment emails the customer that it changed', function () {
    Notification::fake();
    $setup = bookableSetup();
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt']->addDay(),
        'end_at' => $setup['startAt']->addDay()->addMinutes(60),
    ]);

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.update', ['appointment' => $appointment]), appointmentPayload($setup))
        ->assertRedirect();

    Notification::assertSentOnDemand(
        AppointmentBooked::class,
        fn (AppointmentBooked $notification, array $channels, object $notifiable): bool => $notifiable->routeNotificationFor('mail') === 'jane@example.com'
            && $notification->change === AppointmentChange::Updated,
    );
});

test('the update email clearly states the appointment was changed', function () {
    $setup = bookableSetup();
    $customer = Customer::factory()->for($setup['team'])->create([
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
    ]);
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'customer_id' => $customer->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $mail = (new AppointmentBooked($appointment, AppointmentChange::Updated))->toMail($customer);

    expect($mail->subject)->toContain('updated');
    expect((string) $mail->render())->toContain('Your appointment has been updated');
});

test('an appointment can be rescheduled to an available slot', function () {
    $setup = bookableSetup();
    $start = $setup['startAt']->addDay();

    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $start,
        'end_at' => $start->addMinutes(60),
    ]);

    $newStart = $start->setTime(13, 0);

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.reschedule', ['appointment' => $appointment]), [
            'start_at' => $newStart->toIso8601String(),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('appointments', [
        'id' => $appointment->id,
        'start_at' => $newStart->toDateTimeString(),
        'end_at' => $newStart->addMinutes(60)->toDateTimeString(),
    ]);
});

test('an appointment cannot be rescheduled onto an unavailable slot', function () {
    $setup = bookableSetup();
    $start = $setup['startAt']->addDay();

    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $start,
        'end_at' => $start->addMinutes(60),
    ]);

    // Another booking already occupies 15:00 for the same specialist.
    $blocker = $start->setTime(15, 0);
    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $blocker,
        'end_at' => $blocker->addMinutes(60),
    ]);

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.reschedule', ['appointment' => $appointment]), [
            'start_at' => $blocker->toIso8601String(),
        ])
        ->assertRedirect();

    // The appointment keeps its original time.
    $this->assertDatabaseHas('appointments', [
        'id' => $appointment->id,
        'start_at' => $start->toDateTimeString(),
    ]);
});

test('an appointment from another team cannot be rescheduled', function () {
    $setup = bookableSetup();
    $otherAppointment = Appointment::factory()->create();

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.reschedule', ['appointment' => $otherAppointment]), [
            'start_at' => $setup['startAt']->toIso8601String(),
        ])
        ->assertForbidden();
});

test('cancelling an appointment keeps the row and emails the customer', function () {
    Notification::fake();
    $setup = bookableSetup();
    $customer = Customer::factory()->for($setup['team'])->create(['email' => 'jane@example.com']);
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'specialist_id' => $setup['user']->id,
        'customer_id' => $customer->id,
    ]);

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.cancel', ['appointment' => $appointment]))
        ->assertRedirect();

    $this->assertDatabaseHas('appointments', [
        'id' => $appointment->id,
        'status' => 'cancelled',
        'deleted_at' => null,
    ]);
    expect($appointment->fresh()->cancelled_at)->not->toBeNull();

    Notification::assertSentOnDemand(
        AppointmentCancelled::class,
        fn (AppointmentCancelled $notification, array $channels, object $notifiable): bool => $notifiable->routeNotificationFor('mail') === 'jane@example.com',
    );
});

test('an appointment from another team cannot be cancelled', function () {
    $setup = bookableSetup();
    $otherAppointment = Appointment::factory()->create();

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.cancel', ['appointment' => $otherAppointment]))
        ->assertForbidden();
});

test('the calendar invite location is the postal address only, without the business name or unit', function () {
    $setup = bookableSetup();

    $setup['location']->update([
        'name' => 'Downtown Studio',
        'street_address' => '12 Main Street',
        'unit' => 'Suite 4',
        'postal_code' => '1010',
        'city' => 'Vienna',
        'country' => 'AT',
        'place_id' => null,
        'formatted_address' => null,
        'latitude' => null,
        'longitude' => null,
    ]);

    $customer = Customer::factory()->for($setup['team'])->create(['email' => 'jane@example.com']);
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->fresh()->id,
        'specialist_id' => $setup['user']->id,
        'customer_id' => $customer->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $ics = AppointmentCalendar::ics($appointment->fresh());

    $locationLine = collect(explode("\r\n", $ics))
        ->first(fn (string $line): bool => str_starts_with($line, 'LOCATION:'));

    // The name and unit are what previously derailed geocoding.
    expect($locationLine)
        ->toContain('12 Main Street')
        ->toContain('Vienna')
        ->not->toContain('Downtown Studio')
        ->not->toContain('Suite 4');

    // They are still communicated, just not in the geocoded field. Folding
    // splits long lines, so unfold before looking for the values.
    $unfolded = str_replace("\r\n ", '', $ics);

    expect($unfolded)->toContain('Downtown Studio')->toContain('Suite 4');
});

test('a geocoded location adds coordinates to the calendar invite', function () {
    $setup = bookableSetup();

    $setup['location']->update([
        'formatted_address' => 'Stephansplatz 1, 1010 Wien, Austria',
        'place_id' => 'ChIJn8o2UZ4HbUcRRluiUYrlwv0',
        'latitude' => 48.2085000,
        'longitude' => 16.3730000,
    ]);

    $customer = Customer::factory()->for($setup['team'])->create(['email' => 'jane@example.com']);
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'customer_id' => $customer->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $ics = AppointmentCalendar::ics($appointment->fresh());

    expect($ics)
        ->toContain('GEO:48.2085;16.373')
        ->toContain('X-APPLE-STRUCTURED-LOCATION')
        ->toContain('LOCATION:Stephansplatz 1');
});

test('the confirmation email links to directions that pin the exact place', function () {
    $setup = bookableSetup();

    $setup['location']->update([
        'formatted_address' => 'Stephansplatz 1, 1010 Wien, Austria',
        'place_id' => 'ChIJn8o2UZ4HbUcRRluiUYrlwv0',
        'latitude' => 48.2085000,
        'longitude' => 16.3730000,
    ]);

    $customer = Customer::factory()->for($setup['team'])->create([
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
    ]);
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'customer_id' => $customer->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $html = (string) (new AppointmentBooked($appointment->fresh()))->toMail($customer)->render();

    expect($html)
        ->toContain('Get directions')
        ->toContain('destination=48.2085%2C16.373')
        ->toContain('destination_place_id=ChIJn8o2UZ4HbUcRRluiUYrlwv0');
});

test('an online appointment gets no directions link or coordinates', function () {
    $setup = bookableSetup();
    $setup['location']->update(['latitude' => 48.2085, 'longitude' => 16.373]);

    $customer = Customer::factory()->for($setup['team'])->create(['email' => 'jane@example.com']);
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'customer_id' => $customer->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
        'meeting_url' => 'https://meet.google.com/abc-defg-hij',
    ]);

    $appointment = $appointment->fresh();
    $ics = AppointmentCalendar::ics($appointment);
    $html = (string) (new AppointmentBooked($appointment))->toMail($customer)->render();

    expect($ics)
        ->toContain('LOCATION:https://meet.google.com/abc-defg-hij')
        ->not->toContain('GEO:');
    expect($html)->not->toContain('Get directions');
});

test('long calendar lines are folded to stay within the 75 octet limit', function () {
    $setup = bookableSetup();
    $setup['location']->update([
        'formatted_address' => 'Stephansplatz 1, 1010 Wien, Austria',
        'place_id' => 'ChIJn8o2UZ4HbUcRRluiUYrlwv0',
        'latitude' => 48.2085,
        'longitude' => 16.373,
    ]);

    $customer = Customer::factory()->for($setup['team'])->create(['email' => 'jane@example.com']);
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'customer_id' => $customer->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
        'notes' => str_repeat('An unusually long note about parking. ', 10),
    ]);

    foreach (explode("\r\n", AppointmentCalendar::ics($appointment->fresh())) as $line) {
        expect(strlen($line))->toBeLessThanOrEqual(75);
    }
});
