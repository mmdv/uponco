<?php

use App\Enums\AppointmentAlert;
use App\Models\Appointment;
use App\Models\User;
use App\Notifications\Appointments\AppointmentActivity;

/**
 * Give the user a stored notification about the setup's appointment.
 */
function seedNotification(User $user, array $setup, AppointmentAlert $alert = AppointmentAlert::Booked): Appointment
{
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $user->notify(new AppointmentActivity($appointment, $alert, $setup['user']));

    return $appointment;
}

test('the notifications page lists the user\'s own notifications newest first', function () {
    $setup = bookableSetup();
    $user = $setup['user'];

    seedNotification($user, $setup, AppointmentAlert::Booked);
    $this->travel(1)->minutes();
    seedNotification($user, $setup, AppointmentAlert::Cancelled);

    $this
        ->actingAs($user)
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('notifications/index')
            ->has('notifications.data', 2)
            ->where('notifications.data.0.alert', 'cancelled')
            ->where('notifications.data.1.alert', 'booked')
            ->where('notifications.per_page', 50),
        );
});

test('the notifications page never shows another user\'s notifications', function () {
    $setup = bookableSetup();
    $other = User::factory()->create();

    seedNotification($other, $setup);

    $this
        ->actingAs($setup['user'])
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('notifications.data', 0));
});

test('the notifications page paginates at 50', function () {
    $setup = bookableSetup();
    $user = $setup['user'];

    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $user->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    foreach (range(1, 51) as $ignored) {
        $user->notify(new AppointmentActivity($appointment, AppointmentAlert::Booked, $user));
    }

    $this
        ->actingAs($user)
        ->get(route('notifications.index'))
        ->assertInertia(fn ($page) => $page
            ->has('notifications.data', 50)
            ->where('notifications.total', 51)
            ->where('notifications.last_page', 2),
        );

    $this
        ->actingAs($user)
        ->get(route('notifications.index', ['page' => 2]))
        ->assertInertia(fn ($page) => $page->has('notifications.data', 1));
});

test('the shared prop carries the unread count and the ten most recent items', function () {
    $setup = bookableSetup();
    $user = $setup['user'];

    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $user->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    foreach (range(1, 12) as $ignored) {
        $user->notify(new AppointmentActivity($appointment, AppointmentAlert::Booked, $user));
    }

    $this
        ->actingAs($user)
        ->get(route('notifications.index'))
        ->assertInertia(fn ($page) => $page
            ->where('notificationBell.unread', 12)
            ->has('notificationBell.items', 10)
            ->etc(),
        );
});

test('closing the drawer marks the user\'s notifications as read', function () {
    $setup = bookableSetup();
    $user = $setup['user'];

    seedNotification($user, $setup);

    expect($user->unreadNotifications()->count())->toBe(1);

    $this
        ->actingAs($user)
        ->post(route('notifications.read'))
        ->assertRedirect();

    expect($user->unreadNotifications()->count())->toBe(0);
});

test('marking as read leaves a colleague\'s copy of the same event unread', function () {
    $setup = bookableSetup();
    $admin = $setup['user'];
    $member = teamMemberSpecialist($setup);

    // Both are notified about one booking, so each holds their own row.
    $this
        ->post(
            route('public.appointments.store', ['company' => $setup['team']->slug]),
            appointmentPayload($setup, ['specialist_id' => $member->id]),
        )
        ->assertRedirect();

    expect($admin->unreadNotifications()->count())->toBe(1);
    expect($member->unreadNotifications()->count())->toBe(1);

    $this
        ->actingAs($admin)
        ->post(route('notifications.read'))
        ->assertRedirect();

    expect($admin->unreadNotifications()->count())->toBe(0);
    expect($member->unreadNotifications()->count())->toBe(1);
});

test('guests cannot reach the notifications page', function () {
    $this->get(route('notifications.index'))->assertRedirect(route('login'));
    $this->post(route('notifications.read'))->assertRedirect(route('login'));
});
