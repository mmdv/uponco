<?php

use App\Enums\TeamRole;
use App\Models\Appointment;
use App\Models\User;
use App\Notifications\Appointments\AppointmentActivity;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use NotificationChannels\WebPush\WebPushChannel;

/**
 * The stored notifications belonging to a user, newest first.
 *
 * @return Collection<int, object>
 */
function storedNotifications(User $user): Collection
{
    return DB::table('notifications')
        ->where('notifiable_type', $user->getMorphClass())
        ->where('notifiable_id', $user->getKey())
        ->orderByDesc('created_at')
        ->get();
}

/**
 * The `alert` value of each stored notification for a user.
 *
 * @return array<int, string>
 */
function storedAlerts(User $user): array
{
    return storedNotifications($user)
        ->map(fn (object $row): string => json_decode($row->data, true)['alert'])
        ->all();
}

test('a public booking notifies the specialist and the team owner', function () {
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);

    $this
        ->post(
            route('public.appointments.store', ['company' => $setup['team']->slug]),
            appointmentPayload($setup, ['specialist_id' => $member->id]),
        )
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    // The specialist the customer picked, and the owner who runs the team.
    expect(storedAlerts($member))->toBe(['booked']);
    expect(storedAlerts($setup['user']))->toBe(['booked']);
});

test('a member is not notified about a colleague\'s booking', function () {
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);

    $bystander = User::factory()->create();
    $setup['team']->members()->attach($bystander, ['role' => TeamRole::Member->value]);

    $this
        ->post(
            route('public.appointments.store', ['company' => $setup['team']->slug]),
            appointmentPayload($setup, ['specialist_id' => $member->id]),
        )
        ->assertRedirect();

    expect(storedNotifications($bystander))->toBeEmpty();
});

test('an admin is notified about every booking in the team', function () {
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);

    $admin = User::factory()->create();
    $setup['team']->members()->attach($admin, ['role' => TeamRole::Admin->value]);

    $this
        ->post(
            route('public.appointments.store', ['company' => $setup['team']->slug]),
            appointmentPayload($setup, ['specialist_id' => $member->id]),
        )
        ->assertRedirect();

    expect(storedAlerts($admin))->toBe(['booked']);
});

test('the person making the change is not notified about their own action', function () {
    $setup = bookableSetup();

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.store'), appointmentPayload($setup))
        ->assertRedirect();

    expect(storedNotifications($setup['user']))->toBeEmpty();
});

test('reassigning an appointment tells the old specialist it was cancelled and the new one it was booked', function () {
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);
    $other = teamMemberSpecialist($setup);

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
            appointmentPayload($setup, ['specialist_id' => $other->id]),
        )
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect(storedAlerts($member))->toBe(['cancelled']);
    expect(storedAlerts($other))->toBe(['booked']);
});

test('the stored payload carries the booking details', function () {
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);

    $this
        ->post(
            route('public.appointments.store', ['company' => $setup['team']->slug]),
            appointmentPayload($setup, ['specialist_id' => $member->id]),
        )
        ->assertRedirect();

    $data = json_decode(storedNotifications($member)->first()->data, true);

    expect($data['alert'])->toBe('booked');
    expect($data['service_title'])->toBe($setup['service']->title);
    expect($data['customer_name'])->toBe('Jane Doe');
    expect($data['specialist_id'])->toBe($member->id);
    expect($data['specialist_name'])->toBe($member->name);
    expect($data['start_at'])->toBe($setup['startAt']->setTimezone('UTC')->toIso8601String());
});

test('only the assigned specialist is pushed, even after a reassignment', function () {
    Notification::fake();

    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);
    $other = teamMemberSpecialist($setup);

    // A manager who is not the one making the change, so they stay in the
    // audience and can stand in for "everyone who is not the specialist".
    $admin = User::factory()->create();
    $setup['team']->members()->attach($admin, ['role' => TeamRole::Admin->value]);

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
            appointmentPayload($setup, ['specialist_id' => $other->id]),
        )
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    // The outgoing specialist must still be pushed about the slot they lost,
    // even though the appointment now points at their replacement.
    Notification::assertSentTo(
        $member,
        AppointmentActivity::class,
        fn (AppointmentActivity $notification, array $channels): bool => in_array(WebPushChannel::class, $channels, true),
    );

    // The admin is only ever told in-app; managers are not buzzed about other
    // people's appointments.
    Notification::assertSentTo(
        $admin,
        AppointmentActivity::class,
        fn (AppointmentActivity $notification, array $channels): bool => $channels === ['database'],
    );
});
