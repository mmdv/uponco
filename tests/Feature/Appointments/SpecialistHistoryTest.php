<?php

use App\Actions\Teams\DeleteTeam;
use App\Models\Appointment;
use App\Models\Team;
use App\Models\User;

test('creating an appointment snapshots the specialist name', function () {
    $specialist = User::factory()->create(['name' => 'Sarah Mills']);

    $appointment = Appointment::factory()->create(['specialist_id' => $specialist->id]);

    expect($appointment->specialist_name)->toBe('Sarah Mills');
});

test('the snapshot follows a specialist rename while the account exists', function () {
    $specialist = User::factory()->create(['name' => 'Sarah Mills']);
    $appointment = Appointment::factory()->create(['specialist_id' => $specialist->id]);

    $appointment->update(['specialist_id' => $specialist->id]);
    $specialist->update(['name' => 'Sarah Mills-Reid']);
    // Any save re-snapshots only when the link changes; force a link refresh.
    $appointment->specialist_id = $specialist->id;
    $appointment->fill(['specialist_name' => null])->save();

    expect($appointment->fresh()->specialist_name)->toBe('Sarah Mills-Reid');
});

test('deleting the specialist keeps the appointment and its name snapshot', function () {
    $specialist = User::factory()->create(['name' => 'Sarah Mills']);
    $appointment = Appointment::factory()->create(['specialist_id' => $specialist->id]);

    $specialist->delete();

    $appointment->refresh();

    expect(Appointment::whereKey($appointment->id)->exists())->toBeTrue()
        ->and($appointment->specialist_id)->toBeNull()
        ->and($appointment->specialist)->toBeNull()
        ->and($appointment->specialist_name)->toBe('Sarah Mills')
        ->and($appointment->specialistDisplayName())->toBe('Sarah Mills');
});

test('the display name falls back to a neutral label with no snapshot', function () {
    $appointment = Appointment::factory()->make([
        'specialist_id' => null,
        'specialist_name' => null,
    ]);

    expect($appointment->specialistDisplayName())->toBe('Former specialist');
});

test('deleting the team still cascades its appointments away', function () {
    $appointment = Appointment::factory()->create();
    $team = Team::findOrFail($appointment->team_id);

    app(DeleteTeam::class)->handle($team);

    expect(Appointment::whereKey($appointment->id)->exists())->toBeFalse();
});
