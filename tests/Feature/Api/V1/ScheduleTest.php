<?php

use App\Enums\TeamRole;
use App\Models\ScheduleSlot;
use App\Models\Team;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

/**
 * A team with an owner and a plain member, both working in it.
 *
 * @return array{0: Team, 1: User, 2: User}
 */
function apiScheduleTeam(): array
{
    $owner = User::factory()->create(['name' => 'Ada Owner']);
    $member = User::factory()->create(['name' => 'Ben Member']);
    $team = Team::factory()->create(['timezone' => 'Asia/Baku']);

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $owner->switchTeam($team);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($team);

    return [$team, $owner, $member];
}

test('managers can schedule the whole team, members only themselves', function () {
    [, $owner, $member] = apiScheduleTeam();

    Sanctum::actingAs($owner);
    $this->getJson(route('api.v1.schedule.members'))
        ->assertOk()
        ->assertJsonPath('data.*.name', ['Ada Owner', 'Ben Member'])
        ->assertJsonPath('data.1.role', 'member');

    Sanctum::actingAs($member);
    $this->getJson(route('api.v1.schedule.members'))
        ->assertOk()
        ->assertJsonPath('data.*.id', [$member->id]);
});

test('a schedule lists every day in the range, with days off empty', function () {
    [$team, $owner] = apiScheduleTeam();
    ScheduleSlot::factory()->for($owner)->create([
        'team_id' => $team->id, 'date' => '2026-11-09', 'start_time' => '13:00', 'end_time' => '18:00',
    ]);
    ScheduleSlot::factory()->for($owner)->create([
        'team_id' => $team->id, 'date' => '2026-11-09', 'start_time' => '09:00', 'end_time' => '12:00',
    ]);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.schedule.show', ['member' => $owner->id, 'from' => '2026-11-09', 'to' => '2026-11-11']))
        ->assertOk()
        ->assertJsonPath('data.timezone', 'Asia/Baku')
        ->assertJsonPath('data.member.id', $owner->id)
        ->assertJsonPath('data.days.*.date', ['2026-11-09', '2026-11-10', '2026-11-11'])
        ->assertJsonPath('data.days.0.slots', [['start' => '09:00', 'end' => '12:00'], ['start' => '13:00', 'end' => '18:00']])
        ->assertJsonPath('data.days.1.slots', []);
});

test('a member cannot read a colleague\'s hours, nor anyone outside the team', function () {
    [, $owner, $member] = apiScheduleTeam();
    [, $outsider] = apiScheduleTeam();
    $range = ['from' => '2026-11-09', 'to' => '2026-11-15'];

    Sanctum::actingAs($member);
    $this->getJson(route('api.v1.schedule.show', ['member' => $owner->id, ...$range]))->assertNotFound();

    Sanctum::actingAs($owner);
    $this->getJson(route('api.v1.schedule.show', ['member' => $member->id, ...$range]))->assertOk();
    $this->getJson(route('api.v1.schedule.show', ['member' => $outsider->id, ...$range]))->assertNotFound();
});

test('the range must be valid and at most two months', function () {
    [, $owner] = apiScheduleTeam();
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.schedule.show', ['member' => $owner->id, 'from' => '2026-11-09', 'to' => '2026-11-01']))
        ->assertJsonValidationErrors('to');
    $this->getJson(route('api.v1.schedule.show', ['member' => $owner->id, 'from' => '2026-11-01', 'to' => '2027-01-15']))
        ->assertJsonValidationErrors(['to' => __('Choose a shorter date range.')]);
});

test('a manager replaces a member\'s days, and an empty day becomes a day off', function () {
    [$team, $owner, $member] = apiScheduleTeam();
    ScheduleSlot::factory()->for($member)->create(['team_id' => $team->id, 'date' => '2026-11-10']);
    Sanctum::actingAs($owner);

    $this->putJson(route('api.v1.schedule.update', $member), [
        'days' => [
            ['date' => '2026-11-09', 'slots' => [['start' => '09:00', 'end' => '13:00'], ['start' => '14:00', 'end' => '18:00']]],
            ['date' => '2026-11-10', 'slots' => []],
        ],
    ])->assertNoContent();

    expect(ScheduleSlot::where('user_id', $member->id)->whereDate('date', '2026-11-09')->count())->toBe(2)
        ->and(ScheduleSlot::where('user_id', $member->id)->whereDate('date', '2026-11-10')->exists())->toBeFalse();
});

test('overlapping or backwards blocks are rejected', function () {
    [, $owner] = apiScheduleTeam();
    Sanctum::actingAs($owner);

    $this->putJson(route('api.v1.schedule.update', $owner), [
        'days' => [['date' => '2026-11-09', 'slots' => [
            ['start' => '09:00', 'end' => '13:00'],
            ['start' => '12:00', 'end' => '15:00'],
            ['start' => '18:00', 'end' => '17:00'],
        ]]],
    ])->assertJsonValidationErrors([
        'days.0.slots.1.start' => __('Time blocks on the same day cannot overlap.'),
        'days.0.slots.2.end' => __('The end time must be after the start time.'),
    ]);
});

test('a member can save their own hours but not a colleague\'s', function () {
    [, $owner, $member] = apiScheduleTeam();
    Sanctum::actingAs($member);
    $days = ['days' => [['date' => '2026-11-09', 'slots' => [['start' => '09:00', 'end' => '17:00']]]]];

    $this->putJson(route('api.v1.schedule.update', $member), $days)->assertNoContent();
    $this->putJson(route('api.v1.schedule.update', $owner), $days)->assertForbidden();

    expect(ScheduleSlot::where('user_id', $owner->id)->exists())->toBeFalse();
});

test('schedule endpoints require a token', function () {
    $this->getJson(route('api.v1.schedule.members'))->assertUnauthorized();
    $this->putJson(route('api.v1.schedule.update', 1), [])->assertUnauthorized();
});
