<?php

use App\Enums\AppointmentAlert;
use App\Models\Appointment;
use App\Models\User;
use App\Notifications\Appointments\AppointmentActivity;
use Laravel\Sanctum\Sanctum;

/**
 * Store a notification for the user about a new appointment in the setup.
 */
function notifyAboutAppointment(User $user, array $setup, AppointmentAlert $alert = AppointmentAlert::Booked): Appointment
{
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addHour(),
    ]);

    $user->notify(new AppointmentActivity($appointment, $alert, $setup['user']));

    return $appointment;
}

test('the feed lists the user\'s own notifications newest first with the unread count', function () {
    $setup = bookableSetup();
    $booked = notifyAboutAppointment($setup['user'], $setup);
    $this->travel(1)->minutes();
    notifyAboutAppointment($setup['user'], $setup, AppointmentAlert::Cancelled);
    notifyAboutAppointment(User::factory()->create(), $setup);
    Sanctum::actingAs($setup['user']);

    $this->getJson(route('api.v1.notifications.index'))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.alert', 'cancelled')
        ->assertJsonPath('data.0.read', false)
        ->assertJsonPath('data.1.alert', 'booked')
        ->assertJsonPath('data.1.appointment_id', $booked->id)
        ->assertJsonPath('data.1.service_title', $setup['service']->title)
        ->assertJsonPath('meta.unread', 2)
        ->assertJsonPath('meta.per_page', 50);
});

test('marking all read clears only the user\'s own unread notifications', function () {
    $setup = bookableSetup();
    $colleague = teamMemberSpecialist($setup);
    notifyAboutAppointment($setup['user'], $setup);
    notifyAboutAppointment($colleague, $setup);
    Sanctum::actingAs($setup['user']);

    $this->getJson(route('api.v1.notifications.unread-count'))->assertExactJson(['data' => ['unread' => 1]]);

    $this->postJson(route('api.v1.notifications.read'))->assertNoContent();

    $this->getJson(route('api.v1.notifications.unread-count'))->assertExactJson(['data' => ['unread' => 0]]);
    $this->getJson(route('api.v1.notifications.index'))->assertJsonPath('data.0.read', true);
    expect($colleague->unreadNotifications()->count())->toBe(1);
});

test('notification endpoints require a token', function () {
    $this->getJson(route('api.v1.notifications.index'))->assertUnauthorized();
    $this->getJson(route('api.v1.notifications.unread-count'))->assertUnauthorized();
    $this->postJson(route('api.v1.notifications.read'))->assertUnauthorized();
});
