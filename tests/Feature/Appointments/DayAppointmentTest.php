<?php

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Support\Appointments\SlotGenerator;

/**
 * A day-view quick-create payload for the setup, ready to post.
 *
 * @param  array<string, mixed>  $setup
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function dayAppointmentPayload(array $setup, array $overrides = []): array
{
    return array_merge([
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']?->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt']->toIso8601String(),
        'duration' => 45,
        'customer_name' => 'Jane Doe',
        'customer_email' => 'jane@example.com',
        'customer_phone' => '+1 555 123 4567',
        'notes' => 'Walk-in',
    ], $overrides);
}

test('a fitting appointment is created with the chosen duration', function () {
    $setup = bookableSetup();

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.day-store'), dayAppointmentPayload($setup, ['duration' => 45]))
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $this->assertDatabaseHas('appointments', [
        'team_id' => $setup['team']->id,
        'specialist_id' => $setup['user']->id,
        'service_id' => $setup['service']->id,
        'status' => AppointmentStatus::Booked->value,
        'start_at' => $setup['startAt']->format('Y-m-d H:i:s'),
        'end_at' => $setup['startAt']->addMinutes(45)->format('Y-m-d H:i:s'),
    ]);
});

test('a duration that overflows the work window is rejected', function () {
    $setup = bookableSetup();

    // Work window ends 17:00; a 16:30 start + 60 min runs to 17:30.
    $start = $setup['startAt']->setTime(16, 30);

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.day-store'), dayAppointmentPayload($setup, [
            'start_at' => $start->toIso8601String(),
            'duration' => 60,
        ]))
        ->assertInvalid(['duration']);

    $this->assertDatabaseCount('appointments', 0);
});

test('an appointment overlapping an existing booking is rejected', function () {
    $setup = bookableSetup();

    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addHour(),
        'status' => AppointmentStatus::Booked,
    ]);

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.day-store'), dayAppointmentPayload($setup, [
            'start_at' => $setup['startAt']->addMinutes(30)->toIso8601String(),
            'duration' => 30,
        ]))
        ->assertInvalid(['duration']);

    // Only the pre-existing booking remains.
    $this->assertDatabaseCount('appointments', 1);
});

test('fitsAt honours an explicit duration override', function () {
    $setup = bookableSetup();
    $tz = 'UTC';

    // A 90-minute booking at 16:00 runs past the 17:00 window; a 30-minute one fits.
    $start = $setup['startAt']->setTime(16, 0);

    expect(SlotGenerator::fitsAt($setup['service'], $setup['user'], $setup['team']->id, $tz, $start, null, null, 30))
        ->toBeTrue();

    expect(SlotGenerator::fitsAt($setup['service'], $setup['user'], $setup['team']->id, $tz, $start, null, null, 90))
        ->toBeFalse();
});

test('a group service cannot be booked from the day view', function () {
    $setup = bookableSetup(['service_type' => 'group', 'capacity' => 5]);

    $this
        ->actingAs($setup['user'])
        ->post(route('appointments.day-store'), dayAppointmentPayload($setup))
        ->assertInvalid(['service_id']);

    $this->assertDatabaseCount('appointments', 0);
});
