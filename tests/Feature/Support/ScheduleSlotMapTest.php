<?php

use App\Enums\TeamRole;
use App\Models\ScheduleSlot;
use App\Models\Team;
use App\Models\User;
use App\Support\ScheduleSlotMap;

/**
 * Build a team with two attached members.
 *
 * @return array{0: Team, 1: User, 2: User}
 */
function scheduleMapTeam(): array
{
    $team = Team::factory()->create();
    $alice = User::factory()->create();
    $bob = User::factory()->create();

    $team->members()->attach($alice, ['role' => TeamRole::Admin->value]);
    $team->members()->attach($bob, ['role' => TeamRole::Member->value]);

    return [$team, $alice, $bob];
}

test('it maps each working member to their windows for the date, keyed by user id', function () {
    [$team, $alice, $bob] = scheduleMapTeam();

    // Alice works a split shift; Bob works a single window.
    ScheduleSlot::factory()->for($alice)->create([
        'team_id' => $team->id, 'date' => '2026-08-10', 'start_time' => '09:00', 'end_time' => '12:00',
    ]);
    ScheduleSlot::factory()->for($alice)->create([
        'team_id' => $team->id, 'date' => '2026-08-10', 'start_time' => '13:00', 'end_time' => '18:00',
    ]);
    ScheduleSlot::factory()->for($bob)->create([
        'team_id' => $team->id, 'date' => '2026-08-10', 'start_time' => '10:00', 'end_time' => '16:00',
    ]);

    $map = ScheduleSlotMap::forTeamOnDate($team, '2026-08-10');

    expect($map)->toHaveKeys([$alice->id, $bob->id]);
    expect($map[$alice->id])->toBe([
        ['start' => '09:00', 'end' => '12:00'],
        ['start' => '13:00', 'end' => '18:00'],
    ]);
    expect($map[$bob->id])->toBe([
        ['start' => '10:00', 'end' => '16:00'],
    ]);
});

test('a member with no slots that date is absent (day off)', function () {
    [$team, $alice, $bob] = scheduleMapTeam();

    ScheduleSlot::factory()->for($alice)->create([
        'team_id' => $team->id, 'date' => '2026-08-10', 'start_time' => '09:00', 'end_time' => '17:00',
    ]);
    // Bob only works a different day.
    ScheduleSlot::factory()->for($bob)->create([
        'team_id' => $team->id, 'date' => '2026-08-11', 'start_time' => '09:00', 'end_time' => '17:00',
    ]);

    $map = ScheduleSlotMap::forTeamOnDate($team, '2026-08-10');

    expect($map)->toHaveKey($alice->id);
    expect($map)->not->toHaveKey($bob->id);
});

test('only slots for the given team are returned', function () {
    [$team, $alice] = scheduleMapTeam();
    $otherTeam = Team::factory()->create();

    ScheduleSlot::factory()->for($alice)->create([
        'team_id' => $otherTeam->id, 'date' => '2026-08-10', 'start_time' => '09:00', 'end_time' => '17:00',
    ]);

    expect(ScheduleSlotMap::forTeamOnDate($team, '2026-08-10'))->toBe([]);
});

test('onlyUserId restricts the map to a single member', function () {
    [$team, $alice, $bob] = scheduleMapTeam();

    ScheduleSlot::factory()->for($alice)->create([
        'team_id' => $team->id, 'date' => '2026-08-10', 'start_time' => '09:00', 'end_time' => '17:00',
    ]);
    ScheduleSlot::factory()->for($bob)->create([
        'team_id' => $team->id, 'date' => '2026-08-10', 'start_time' => '09:00', 'end_time' => '17:00',
    ]);

    $map = ScheduleSlotMap::forTeamOnDate($team, '2026-08-10', $bob->id);

    expect($map)->toHaveKey($bob->id);
    expect($map)->not->toHaveKey($alice->id);
});

test('forTeamBetween keys every requested day, populating worked days and leaving days off empty', function () {
    [$team, $alice, $bob] = scheduleMapTeam();

    ScheduleSlot::factory()->for($alice)->create([
        'team_id' => $team->id, 'date' => '2026-08-10', 'start_time' => '09:00', 'end_time' => '12:00',
    ]);
    ScheduleSlot::factory()->for($bob)->create([
        'team_id' => $team->id, 'date' => '2026-08-12', 'start_time' => '10:00', 'end_time' => '16:00',
    ]);

    $map = ScheduleSlotMap::forTeamBetween($team, '2026-08-10', '2026-08-12');

    // Every day in the range is present, so the client can cache the whole window.
    expect(array_keys($map))->toBe(['2026-08-10', '2026-08-11', '2026-08-12']);
    expect($map['2026-08-10'][$alice->id])->toBe([['start' => '09:00', 'end' => '12:00']]);
    expect($map['2026-08-11'])->toBe([]); // a day nobody works
    expect($map['2026-08-12'][$bob->id])->toBe([['start' => '10:00', 'end' => '16:00']]);
});

test('forTeamBetween can restrict to a single member across the range', function () {
    [$team, $alice, $bob] = scheduleMapTeam();

    ScheduleSlot::factory()->for($alice)->create([
        'team_id' => $team->id, 'date' => '2026-08-10', 'start_time' => '09:00', 'end_time' => '17:00',
    ]);
    ScheduleSlot::factory()->for($bob)->create([
        'team_id' => $team->id, 'date' => '2026-08-10', 'start_time' => '09:00', 'end_time' => '17:00',
    ]);

    $map = ScheduleSlotMap::forTeamBetween($team, '2026-08-10', '2026-08-11', $bob->id);

    expect($map['2026-08-10'])->toHaveKey($bob->id);
    expect($map['2026-08-10'])->not->toHaveKey($alice->id);
});
