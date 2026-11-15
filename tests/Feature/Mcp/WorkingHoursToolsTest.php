<?php

use App\Enums\AppointmentStatus;
use App\Mcp\Servers\UponcoServer;
use App\Mcp\Tools\SetDayOffTool;
use App\Mcp\Tools\SetWorkingHoursTool;
use App\Support\ScheduleSlotMap;

test('set-working-hours replaces the chosen weekdays and reports bookings left outside them', function () {
    $setup = bookableSetup();
    $monday = $setup['startAt']; // bookableSetup starts on a Monday
    $outside = mcpAppointment($setup, $setup['user']); // Monday 09:00–10:00

    UponcoServer::actingAs($setup['user'])
        ->tool(SetWorkingHoursTool::class, [
            'from' => $monday->toDateString(),
            'to' => $monday->addDays(6)->toDateString(),
            'weekdays' => ['monday', 'wednesday'],
            'hours' => [['start' => '14:00', 'end' => '18:00'], ['start' => '10:00', 'end' => '13:00']],
        ])
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json
            ->where('dates', [$monday->toDateString(), $monday->addDays(2)->toDateString()])
            ->where('hours', [['start' => '10:00', 'end' => '13:00'], ['start' => '14:00', 'end' => '18:00']])
            ->has('appointments_outside_hours', 1)
            ->where('appointments_outside_hours.0.id', $outside->id)
            ->etc());

    $map = ScheduleSlotMap::forMember($setup['team'], $setup['user'], $monday->toDateString(), $monday->addDays(2)->toDateString());

    expect($map[$monday->toDateString()])->toBe([['start' => '10:00', 'end' => '13:00'], ['start' => '14:00', 'end' => '18:00']])
        ->and($map[$monday->addDay()->toDateString()])->toBe([['start' => '09:00', 'end' => '17:00']])
        ->and($outside->refresh()->status)->toBe(AppointmentStatus::Booked);
});

test('set-working-hours rejects overlapping blocks', function () {
    $setup = bookableSetup();

    UponcoServer::actingAs($setup['user'])
        ->tool(SetWorkingHoursTool::class, [
            'from' => $setup['startAt']->toDateString(),
            'hours' => [['start' => '09:00', 'end' => '13:00'], ['start' => '12:00', 'end' => '15:00']],
        ])
        ->assertHasErrors(['Time blocks on the same day cannot overlap.']);
});

test('owners can change anyone\'s hours but members only their own', function () {
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);
    $arguments = ['from' => $setup['startAt']->toDateString(), 'hours' => [['start' => '10:00', 'end' => '12:00']]];

    UponcoServer::actingAs($member)
        ->tool(SetWorkingHoursTool::class, [...$arguments, 'specialist_id' => $setup['user']->id])
        ->assertHasErrors(['You can only change your own working hours.']);

    UponcoServer::actingAs($setup['user'])
        ->tool(SetWorkingHoursTool::class, [...$arguments, 'specialist_id' => $member->id])
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json->where('specialist.id', $member->id)->etc());
});

test('set-day-off clears the days but keeps and reports the bookings on them', function () {
    $setup = bookableSetup();
    $booked = mcpAppointment($setup, $setup['user']);
    $day = $setup['startAt']->toDateString();

    UponcoServer::actingAs($setup['user'])
        ->tool(SetDayOffTool::class, ['from' => $day, 'to' => $setup['startAt']->addDay()->toDateString()])
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json
            ->where('day_off', true)
            ->where('hours', [])
            ->where('appointments_outside_hours.0.id', $booked->id)
            ->etc());

    expect(ScheduleSlotMap::forMember($setup['team'], $setup['user'], $day, $setup['startAt']->addDays(2)->toDateString()))
        ->not->toHaveKey($day)
        ->toHaveKey($setup['startAt']->addDays(2)->toDateString())
        ->and($booked->refresh()->status)->toBe(AppointmentStatus::Booked);
});
