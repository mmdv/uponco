<?php

use App\Enums\TeamRole;
use App\Models\Appointment;
use App\Models\User;

/**
 * Create a past appointment for the given specialist in the setup's team.
 */
function pastAppointment(array $setup, ?int $specialistId = null): Appointment
{
    return Appointment::factory()->past()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $specialistId ?? $setup['user']->id,
    ]);
}

test('an owner can mark a past appointment as a no-show', function () {
    $setup = bookableSetup();
    $appointment = pastAppointment($setup);

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.status', ['appointment' => $appointment]), ['status' => 'no_show'])
        ->assertRedirect();

    $this->assertDatabaseHas('appointments', [
        'id' => $appointment->id,
        'status' => 'no_show',
        'deleted_at' => null,
    ]);
});

test('a member can mark their own past appointment as a no-show', function () {
    $setup = bookableSetup();
    $member = User::factory()->create();
    $setup['team']->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($setup['team']);

    $appointment = pastAppointment($setup, $member->id);

    $this
        ->actingAs($member)
        ->patch(route('appointments.status', ['appointment' => $appointment]), ['status' => 'no_show'])
        ->assertRedirect();

    expect($appointment->fresh()->status->value)->toBe('no_show');
});

test('marking a no-show back to booked undoes it', function () {
    $setup = bookableSetup();
    $appointment = pastAppointment($setup);
    $appointment->markNoShow();

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.status', ['appointment' => $appointment]), ['status' => 'booked'])
        ->assertRedirect();

    expect($appointment->fresh()->status->value)->toBe('booked');
});

test('a future appointment cannot be marked as a no-show', function () {
    $setup = bookableSetup();
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
    ]);

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.status', ['appointment' => $appointment]), ['status' => 'no_show'])
        ->assertForbidden();

    expect($appointment->fresh()->status->value)->toBe('booked');
});

test('the status must be booked or no_show', function () {
    $setup = bookableSetup();
    $appointment = pastAppointment($setup);

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.status', ['appointment' => $appointment]), ['status' => 'cancelled'])
        ->assertSessionHasErrors('status');
});

test('a member cannot mark another specialist past appointment as a no-show', function () {
    $setup = bookableSetup();
    $member = User::factory()->create();
    $setup['team']->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($setup['team']);

    // Owned by the owner, not the member.
    $appointment = pastAppointment($setup);

    $this
        ->actingAs($member)
        ->patch(route('appointments.status', ['appointment' => $appointment]), ['status' => 'no_show'])
        ->assertForbidden();

    expect($appointment->fresh()->status->value)->toBe('booked');
});

test('an owner can delete a past appointment', function () {
    $setup = bookableSetup();
    $appointment = pastAppointment($setup);

    $this
        ->actingAs($setup['user'])
        ->delete(route('appointments.destroy', ['appointment' => $appointment]))
        ->assertRedirect();

    $this->assertSoftDeleted('appointments', ['id' => $appointment->id]);
});

test('a deleted past appointment is gone from the schedule listing', function () {
    $setup = bookableSetup();
    $appointment = pastAppointment($setup);
    $appointment->delete();

    $this
        ->actingAs($setup['user'])
        ->get(route('appointments.index'))
        ->assertInertia(fn ($page) => $page->where('appointments', fn ($appointments) => collect($appointments)->doesntContain('id', $appointment->id)));
});

test('a past no-show still appears in the schedule but a cancelled one does not', function () {
    $setup = bookableSetup();
    $noShow = pastAppointment($setup);
    $noShow->markNoShow();
    $cancelled = pastAppointment($setup);
    $cancelled->cancel();

    $this
        ->actingAs($setup['user'])
        ->get(route('appointments.index'))
        ->assertInertia(fn ($page) => $page
            ->where('appointments', fn ($appointments) => collect($appointments)->contains('id', $noShow->id)
                && collect($appointments)->doesntContain('id', $cancelled->id)));
});

test('a future appointment cannot be deleted', function () {
    $setup = bookableSetup();
    $appointment = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
    ]);

    $this
        ->actingAs($setup['user'])
        ->delete(route('appointments.destroy', ['appointment' => $appointment]))
        ->assertForbidden();

    $this->assertDatabaseHas('appointments', [
        'id' => $appointment->id,
        'deleted_at' => null,
    ]);
});

test('a member cannot delete another specialist past appointment', function () {
    $setup = bookableSetup();
    $member = User::factory()->create();
    $setup['team']->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($setup['team']);

    $appointment = pastAppointment($setup);

    $this
        ->actingAs($member)
        ->delete(route('appointments.destroy', ['appointment' => $appointment]))
        ->assertForbidden();

    $this->assertDatabaseHas('appointments', ['id' => $appointment->id, 'deleted_at' => null]);
});

test('a no-show cannot be marked across teams', function () {
    $setup = bookableSetup();
    $otherSetup = bookableSetup();
    $appointment = pastAppointment($otherSetup);

    $this
        ->actingAs($setup['user'])
        ->patch(route('appointments.status', ['appointment' => $appointment]), ['status' => 'no_show'])
        ->assertForbidden();
});
