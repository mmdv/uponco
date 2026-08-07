<?php

use App\Enums\TeamRole;
use App\Models\ScheduleSlot;
use App\Models\Team;
use App\Models\User;
use Inertia\Inertia;

/**
 * Build a team with an owner and a plain member, both switched onto it.
 *
 * @return array{0: Team, 1: User, 2: User}
 */
function memberScheduleTeam(): array
{
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $owner->switchTeam($team);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($team);

    return [$team, $owner, $member];
}

test('a manager saves different hours for several days in one request', function () {
    [$team, $owner, $member] = memberScheduleTeam();

    $this
        ->actingAs($owner)
        ->put(route('schedule.member.update', $member), [
            'days' => [
                ['date' => '2026-08-10', 'slots' => [['start' => '09:00', 'end' => '17:00']]],
                ['date' => '2026-08-11', 'slots' => [
                    ['start' => '09:00', 'end' => '12:00'],
                    ['start' => '13:00', 'end' => '18:00'],
                ]],
                ['date' => '2026-08-12', 'slots' => [['start' => '10:00', 'end' => '14:00']]],
            ],
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect(ScheduleSlot::where('user_id', $member->id)->count())->toBe(4);
    expect(ScheduleSlot::where('user_id', $member->id)->whereDate('date', '2026-08-11')->count())->toBe(2);
    expect(ScheduleSlot::where('team_id', $team->id)->where('user_id', $owner->id)->count())->toBe(0);
});

test('an empty slots array clears the day', function () {
    [$team, , $member] = memberScheduleTeam();

    ScheduleSlot::factory()->for($member)->count(2)->create([
        'team_id' => $team->id,
        'date' => '2026-08-10',
    ]);

    $this
        ->actingAs($member)
        ->put(route('schedule.member.update', $member), [
            'days' => [
                ['date' => '2026-08-10', 'slots' => []],
            ],
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect(ScheduleSlot::where('user_id', $member->id)->whereDate('date', '2026-08-10')->count())->toBe(0);
});

test('clearing one day leaves the other days alone', function () {
    [$team, , $member] = memberScheduleTeam();

    ScheduleSlot::factory()->for($member)->create([
        'team_id' => $team->id,
        'date' => '2026-08-10',
    ]);
    ScheduleSlot::factory()->for($member)->create([
        'team_id' => $team->id,
        'date' => '2026-08-11',
    ]);

    $this
        ->actingAs($member)
        ->put(route('schedule.member.update', $member), [
            'days' => [
                ['date' => '2026-08-10', 'slots' => []],
            ],
        ])
        ->assertSessionHasNoErrors();

    expect(ScheduleSlot::where('user_id', $member->id)->whereDate('date', '2026-08-11')->count())->toBe(1);
});

test('a plain member cannot touch another members schedule', function () {
    [, $owner, $member] = memberScheduleTeam();

    $this
        ->actingAs($member)
        ->put(route('schedule.member.update', $owner), [
            'days' => [
                ['date' => '2026-08-10', 'slots' => [['start' => '09:00', 'end' => '17:00']]],
            ],
        ])
        ->assertForbidden();

    expect(ScheduleSlot::where('user_id', $owner->id)->count())->toBe(0);
});

test('a manager cannot schedule someone outside their team', function () {
    [, $owner] = memberScheduleTeam();
    $stranger = User::factory()->create();

    $this
        ->actingAs($owner)
        ->put(route('schedule.member.update', $stranger), [
            'days' => [
                ['date' => '2026-08-10', 'slots' => [['start' => '09:00', 'end' => '17:00']]],
            ],
        ])
        ->assertForbidden();

    expect(ScheduleSlot::where('user_id', $stranger->id)->count())->toBe(0);
});

test('a block must end after it starts', function () {
    [, , $member] = memberScheduleTeam();

    $this
        ->actingAs($member)
        ->put(route('schedule.member.update', $member), [
            'days' => [
                ['date' => '2026-08-10', 'slots' => [['start' => '17:00', 'end' => '09:00']]],
            ],
        ])
        ->assertSessionHasErrors('days.0.slots.0.end');

    expect(ScheduleSlot::count())->toBe(0);
});

test('blocks on the same day cannot overlap', function () {
    [, , $member] = memberScheduleTeam();

    $this
        ->actingAs($member)
        ->put(route('schedule.member.update', $member), [
            'days' => [
                ['date' => '2026-08-10', 'slots' => [
                    ['start' => '09:00', 'end' => '13:00'],
                    ['start' => '12:00', 'end' => '17:00'],
                ]],
            ],
        ])
        ->assertSessionHasErrors('days.0.slots.1.start');

    expect(ScheduleSlot::count())->toBe(0);
});

test('back to back blocks do not count as overlapping', function () {
    [, , $member] = memberScheduleTeam();

    $this
        ->actingAs($member)
        ->put(route('schedule.member.update', $member), [
            'days' => [
                ['date' => '2026-08-10', 'slots' => [
                    ['start' => '09:00', 'end' => '13:00'],
                    ['start' => '13:00', 'end' => '17:00'],
                ]],
            ],
        ])
        ->assertSessionHasNoErrors();

    expect(ScheduleSlot::where('user_id', $member->id)->count())->toBe(2);
});

test('the my schedule page renders the signed in users own schedule', function () {
    [$team, , $member] = memberScheduleTeam();

    ScheduleSlot::factory()->for($member)->create([
        'team_id' => $team->id,
        'date' => '2026-08-10',
        'start_time' => '09:00',
        'end_time' => '17:00',
    ]);

    $this
        ->actingAs($member)
        ->get(route('schedule.my', ['from' => '2026-08-01', 'to' => '2026-08-31']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('schedule/my')
            ->where('member.id', $member->id)
            ->has('schedule.2026-08-10', 1)
            ->where('schedule.2026-08-10.0.start', '09:00')
            ->where('schedule.2026-08-10.0.end', '17:00')
        );
});

test('the slot map only covers the requested range', function () {
    [$team, , $member] = memberScheduleTeam();

    ScheduleSlot::factory()->for($member)->create([
        'team_id' => $team->id,
        'date' => '2026-08-10',
    ]);
    ScheduleSlot::factory()->for($member)->create([
        'team_id' => $team->id,
        'date' => '2026-09-10',
    ]);

    $this
        ->actingAs($member)
        ->get(route('schedule.my', ['from' => '2026-08-01', 'to' => '2026-08-31']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('schedule.2026-08-10')
            ->missing('schedule.2026-09-10')
        );
});

test('the member edit page resolves the schedule only when a partial reload asks for it', function () {
    [$team, $owner, $member] = memberScheduleTeam();

    ScheduleSlot::factory()->for($member)->create([
        'team_id' => $team->id,
        'date' => '2026-08-10',
        'start_time' => '09:00',
        'end_time' => '17:00',
    ]);

    // A normal visit lands on the Profile section, so the schedule query must
    // not run at all.
    $this
        ->actingAs($owner)
        ->get(route('company.business.members.edit', $member))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('company/business/members/edit')
            ->missing('schedule')
            ->missing('scheduleMembers')
        );

    // Opening the Schedule section reloads just those props for its range.
    // The asset version is only resolved once a request has run, hence the
    // full visit above.
    $this
        ->actingAs($owner)
        ->get(
            route('company.business.members.edit', [$member, 'from' => '2026-08-01', 'to' => '2026-08-31']),
            [
                'X-Inertia' => 'true',
                'X-Inertia-Version' => Inertia::getVersion(),
                'X-Inertia-Partial-Component' => 'company/business/members/edit',
                'X-Inertia-Partial-Data' => 'schedule,scheduleMembers',
            ]
        )
        ->assertOk()
        // A partial reload returns JSON rather than the Inertia root view, so
        // the props are asserted directly.
        ->assertJsonCount(1, 'props.schedule.2026-08-10')
        ->assertJsonPath('props.schedule.2026-08-10.0.start', '09:00')
        ->assertJsonPath('props.schedule.2026-08-10.0.end', '17:00')
        ->assertJsonCount(2, 'props.scheduleMembers')
        ->assertJsonMissingPath('props.member');
});

test('the schedule page points the week view at the requester by default', function () {
    [, , $member] = memberScheduleTeam();

    $this
        ->actingAs($member)
        ->get(route('schedule.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('schedule/index')
            ->where('selectedMember.id', $member->id)
            // Resolved only when the Week/Month views ask for it, so the Team
            // grid costs nothing extra.
            ->missing('memberSchedule')
        );
});

test('a manager can point the week view at another member', function () {
    [, $owner, $member] = memberScheduleTeam();

    $this
        ->actingAs($owner)
        ->get(route('schedule.index', ['member' => $member->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('selectedMember.id', $member->id));
});

test('a plain member cannot read a colleagues hours through the query string', function () {
    [, $owner, $member] = memberScheduleTeam();

    $this
        ->actingAs($member)
        ->get(route('schedule.index', ['member' => $owner->id]))
        ->assertOk()
        // Falls back to themselves rather than honouring the id.
        ->assertInertia(fn ($page) => $page->where('selectedMember.id', $member->id));
});

test('the schedule page returns the selected members range on a partial reload', function () {
    [$team, $owner, $member] = memberScheduleTeam();

    ScheduleSlot::factory()->for($member)->create([
        'team_id' => $team->id,
        'date' => '2026-08-10',
        'start_time' => '09:00',
        'end_time' => '17:00',
    ]);

    $this->actingAs($owner)->get(route('schedule.index'))->assertOk();

    $this
        ->actingAs($owner)
        ->get(
            route('schedule.index', [
                'member' => $member->id,
                'from' => '2026-08-01',
                'to' => '2026-08-31',
            ]),
            [
                'X-Inertia' => 'true',
                'X-Inertia-Version' => Inertia::getVersion(),
                'X-Inertia-Partial-Component' => 'schedule/index',
                'X-Inertia-Partial-Data' => 'memberSchedule',
            ]
        )
        ->assertOk()
        ->assertJsonCount(1, 'props.memberSchedule.2026-08-10')
        ->assertJsonPath('props.memberSchedule.2026-08-10.0.start', '09:00');
});
