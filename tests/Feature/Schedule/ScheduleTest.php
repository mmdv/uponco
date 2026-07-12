<?php

use App\Enums\TeamRole;
use App\Models\ScheduleSlot;
use App\Models\Team;
use App\Models\User;

test('managers schedule the whole team', function () {
    $owner = User::factory()->create();
    $admin = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($admin)
        ->get(route('schedule.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('schedule/index')
            ->has('members', 3)
        );
});

test('plain members only schedule themselves', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($member)
        ->get(route('schedule.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('schedule/index')
            ->has('members', 1)
            ->where('members.0.id', $member->id)
            ->where('members.0.role', TeamRole::Member->value)
        );
});

test('existing slots are returned keyed by member and date', function () {
    $member = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    ScheduleSlot::factory()->for($member)->create([
        'team_id' => $team->id,
        'date' => '2026-07-20',
        'start_time' => '09:00',
        'end_time' => '12:00',
    ]);
    ScheduleSlot::factory()->for($member)->create([
        'team_id' => $team->id,
        'date' => '2026-07-20',
        'start_time' => '13:00',
        'end_time' => '17:00',
    ]);

    $key = "{$member->id}:2026-07-20";

    $this
        ->actingAs($member)
        ->get(route('schedule.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has("slots.{$key}", 2)
            ->where("slots.{$key}.0.start", '09:00')
            ->where("slots.{$key}.0.end", '12:00')
        );
});

test('managers can save slots for multiple members and days at once', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($owner)
        ->post(route('schedule.store', ['current_team' => $team->slug]), [
            'assignments' => [
                ['user_id' => $owner->id, 'date' => '2026-07-20'],
                ['user_id' => $member->id, 'date' => '2026-07-21'],
            ],
            'slots' => [
                ['start' => '09:00', 'end' => '12:00'],
                ['start' => '13:00', 'end' => '17:00'],
            ],
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect(ScheduleSlot::where('team_id', $team->id)->count())->toBe(4);
    expect(ScheduleSlot::where('user_id', $member->id)->whereDate('date', '2026-07-21')->count())->toBe(2);
});

test('saving a day replaces its existing slots', function () {
    $member = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    ScheduleSlot::factory()->for($member)->count(2)->create([
        'team_id' => $team->id,
        'date' => '2026-07-20',
    ]);

    $this
        ->actingAs($member)
        ->post(route('schedule.store', ['current_team' => $team->slug]), [
            'assignments' => [
                ['user_id' => $member->id, 'date' => '2026-07-20'],
            ],
            'slots' => [
                ['start' => '10:00', 'end' => '14:00'],
            ],
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $slots = ScheduleSlot::where('user_id', $member->id)->whereDate('date', '2026-07-20')->get();

    expect($slots)->toHaveCount(1);
    expect(substr((string) $slots->first()->start_time, 0, 5))->toBe('10:00');
});

test('members cannot save slots for another member', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($member)
        ->post(route('schedule.store', ['current_team' => $team->slug]), [
            'assignments' => [
                ['user_id' => $owner->id, 'date' => '2026-07-20'],
            ],
            'slots' => [
                ['start' => '09:00', 'end' => '17:00'],
            ],
        ])
        ->assertSessionHasErrors('assignments.0.user_id');

    expect(ScheduleSlot::where('user_id', $owner->id)->count())->toBe(0);
});

test('a slot end time must be after its start time', function () {
    $member = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($member)
        ->post(route('schedule.store', ['current_team' => $team->slug]), [
            'assignments' => [
                ['user_id' => $member->id, 'date' => '2026-07-20'],
            ],
            'slots' => [
                ['start' => '17:00', 'end' => '09:00'],
            ],
        ])
        ->assertSessionHasErrors('slots.0.end');

    expect(ScheduleSlot::count())->toBe(0);
});
