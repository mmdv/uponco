<?php

use App\Enums\AppointmentChange;
use App\Enums\TeamRole;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use App\Models\WorkHour;
use App\Notifications\Appointments\AppointmentBooked;
use App\Support\Appointments\SlotGenerator;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Notification;

/**
 * Build a fully related service/location/specialist scenario with work hours,
 * and return the pieces plus a valid future start instant.
 */
function bookableSetup(array $serviceOverrides = []): array
{
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $team->update(['timezone' => 'UTC']);

    $category = ServiceCategory::factory()->for($team)->create();
    $service = Service::factory()->for($category, 'category')->create(array_merge([
        'duration' => 60,
        'technical_break' => 0,
        'delivery_type' => 'onsite',
        'online_meeting_provider' => null,
        'is_active' => true,
    ], $serviceOverrides));

    $location = Location::factory()->for($team)->create();

    $service->locations()->attach($location);
    $service->specialists()->attach($user);
    $location->specialists()->attach($user);

    foreach (range(0, 6) as $dayOfWeek) {
        WorkHour::factory()->for($user)->create([
            'team_id' => $team->id,
            'day_of_week' => $dayOfWeek,
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);
    }

    $startAt = CarbonImmutable::now('UTC')->addWeek()->startOfWeek()->setTime(9, 0);

    return compact('user', 'team', 'service', 'location', 'startAt');
}

function appointmentPayload(array $setup, array $overrides = []): array
{
    return array_merge([
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt']->toIso8601String(),
        'customer_name' => 'Jane Doe',
        'customer_email' => 'jane@example.com',
        'customer_phone' => '+1 555 123 4567',
        'notes' => 'First visit',
    ], $overrides);
}

test('the appointments page can be rendered', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->get(route('appointments.index', ['current_team' => $team->slug]))
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
        ->get(route('appointments.index', ['current_team' => $setup['team']->slug]))
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
        ->get(route('appointments.index', ['current_team' => $setup['team']->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('appointments', 2));
});

test('members only see appointments assigned to them', function () {
    $setup = bookableSetup();
    $member = User::factory()->create();
    $setup['team']->members()->attach($member, ['role' => TeamRole::Member->value]);

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
        ->get(route('appointments.index', ['current_team' => $setup['team']->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('appointments', 1)
            ->where('appointments.0.id', $mine->id)
        );
});

test('a member cannot delete an appointment that is not theirs', function () {
    $setup = bookableSetup();
    $member = User::factory()->create();
    $setup['team']->members()->attach($member, ['role' => TeamRole::Member->value]);

    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
    ]);

    $this
        ->actingAs($member)
        ->delete(route('appointments.destroy', ['current_team' => $setup['team']->slug, 'appointment' => $appointment->id]))
        ->assertForbidden();

    $this->assertDatabaseHas('appointments', ['id' => $appointment->id, 'deleted_at' => null]);
});

test('a member can delete their own appointment', function () {
    $setup = bookableSetup();
    $member = User::factory()->create();
    $setup['team']->members()->attach($member, ['role' => TeamRole::Member->value]);

    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $member->id,
    ]);

    $this
        ->actingAs($member)
        ->delete(route('appointments.destroy', ['current_team' => $setup['team']->slug, 'appointment' => $appointment->id]))
        ->assertRedirect();

    $this->assertSoftDeleted('appointments', ['id' => $appointment->id]);
});

test('an appointment can be created and creates a customer', function () {
    $setup = bookableSetup();

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store', ['current_team' => $setup['team']->slug]), appointmentPayload($setup))
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
        ->post(route('appointments.store', ['current_team' => $setup['team']->slug]), appointmentPayload($setup))
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
        ->post(route('appointments.store', ['current_team' => $setup['team']->slug]), appointmentPayload($setup, [
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
        ->post(route('appointments.store', ['current_team' => $setup['team']->slug]), appointmentPayload($setup))
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
        ->post(route('appointments.store', ['current_team' => $setup['team']->slug]), appointmentPayload($setup))
        ->assertSessionHasErrors('start_at');
});

test('an appointment requires a service, specialist and start time', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->post(route('appointments.store', ['current_team' => $team->slug]), [
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
        ])
        ->assertSessionHasErrors(['service_id', 'specialist_id', 'start_at']);
});

test('an onsite appointment requires a location', function () {
    $setup = bookableSetup();

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store', ['current_team' => $setup['team']->slug]), appointmentPayload($setup, [
            'location_id' => null,
        ]))
        ->assertSessionHasErrors('location_id');
});

test('an online appointment can be created without a location', function () {
    $setup = bookableSetup(['delivery_type' => 'online', 'online_meeting_provider' => 'google_meet']);

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store', ['current_team' => $setup['team']->slug]), appointmentPayload($setup, [
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

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store', ['current_team' => $setup['team']->slug]), appointmentPayload($setup, [
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
        ->patch(route('appointments.update', ['current_team' => $setup['team']->slug, 'appointment' => $appointment]), appointmentPayload($setup, [
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
        ->patch(route('appointments.update', ['current_team' => $setup['team']->slug, 'appointment' => $appointment]), appointmentPayload($setup, [
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
        ->patch(route('appointments.reschedule', ['current_team' => $setup['team']->slug, 'appointment' => $appointment]), [
            'start_at' => $setup['startAt']->toIso8601String(),
        ])
        ->assertForbidden();
});

test('a past appointment cannot be deleted', function () {
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
        ->delete(route('appointments.destroy', ['current_team' => $setup['team']->slug, 'appointment' => $appointment]))
        ->assertForbidden();

    $this->assertDatabaseHas('appointments', [
        'id' => $appointment->id,
        'deleted_at' => null,
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
        ->patch(route('appointments.update', ['current_team' => $setup['team']->slug, 'appointment' => $appointment]), appointmentPayload($setup))
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
        ->patch(route('appointments.reschedule', ['current_team' => $setup['team']->slug, 'appointment' => $appointment]), [
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
        ->patch(route('appointments.reschedule', ['current_team' => $setup['team']->slug, 'appointment' => $appointment]), [
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
        ->patch(route('appointments.reschedule', ['current_team' => $setup['team']->slug, 'appointment' => $otherAppointment]), [
            'start_at' => $setup['startAt']->toIso8601String(),
        ])
        ->assertForbidden();
});

test('an appointment can be deleted', function () {
    $setup = bookableSetup();
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'specialist_id' => $setup['user']->id,
    ]);

    $this
        ->actingAs($setup['user'])
        ->delete(route('appointments.destroy', ['current_team' => $setup['team']->slug, 'appointment' => $appointment]))
        ->assertRedirect();

    $this->assertSoftDeleted($appointment);
});

test('an appointment from another team cannot be deleted', function () {
    $setup = bookableSetup();
    $otherAppointment = Appointment::factory()->create();

    $this
        ->actingAs($setup['user'])
        ->delete(route('appointments.destroy', ['current_team' => $setup['team']->slug, 'appointment' => $otherAppointment]))
        ->assertForbidden();
});
