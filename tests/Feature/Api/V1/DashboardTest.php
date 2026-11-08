<?php

use App\Enums\TeamPermission;
use App\Enums\TeamRole;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\ScheduleSlot;
use App\Models\Team;
use App\Models\User;
use Carbon\CarbonImmutable;
use Laravel\Sanctum\Sanctum;

/**
 * A team with an owner and a member, signed in as the given role.
 *
 * @return array{team: Team, owner: User, member: User}
 */
function apiDashboardTeam(): array
{
    $team = Team::factory()->create(['timezone' => 'Asia/Baku']);
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $owner->switchTeam($team);
    $member->switchTeam($team);

    return ['team' => $team, 'owner' => $owner, 'member' => $member];
}

test('the dashboard requires a token', function () {
    $this->getJson(route('api.v1.dashboard'))->assertUnauthorized();
});

test('the dashboard requires a verified email', function () {
    Sanctum::actingAs(User::factory()->unverified()->create());

    $this->getJson(route('api.v1.dashboard'))->assertForbidden();
});

test('owners see every booking on the team', function () {
    ['team' => $team, 'owner' => $owner, 'member' => $member] = apiDashboardTeam();
    Customer::factory()->count(2)->create(['team_id' => $team->id]);
    Appointment::factory()->create(['team_id' => $team->id, 'specialist_id' => $owner->id, 'start_at' => now()->addDay()]);
    Appointment::factory()->count(2)->create(['team_id' => $team->id, 'specialist_id' => $member->id, 'start_at' => now()->addDay()]);
    Appointment::factory()->cancelled()->create(['team_id' => $team->id, 'specialist_id' => $member->id, 'start_at' => now()->addDay()]);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.dashboard'))
        ->assertOk()
        ->assertJsonPath('data.timezone', 'Asia/Baku')
        ->assertJsonPath('data.sees_all_appointments', true)
        ->assertJsonPath('data.stats.upcoming', 3)
        ->assertJsonPath('data.stats.total_bookings', 3)
        ->assertJsonCount(3, 'data.upcoming_appointments')
        ->assertJsonPath('data.schedule', null)
        ->assertJsonPath('data.booking_url', route('public.appointments.show', ['company' => $team->slug]));
});

test('members only see their own bookings', function () {
    ['team' => $team, 'owner' => $owner, 'member' => $member] = apiDashboardTeam();
    $own = Appointment::factory()->create(['team_id' => $team->id, 'specialist_id' => $member->id, 'start_at' => now()->addDay()]);
    Appointment::factory()->count(2)->create(['team_id' => $team->id, 'specialist_id' => $owner->id, 'start_at' => now()->addDay()]);
    Sanctum::actingAs($member);

    $this->getJson(route('api.v1.dashboard'))
        ->assertOk()
        ->assertJsonPath('data.sees_all_appointments', false)
        ->assertJsonPath('data.stats.upcoming', 1)
        ->assertJsonCount(1, 'data.upcoming_appointments')
        ->assertJsonPath('data.upcoming_appointments.0.id', $own->id);
});

test('a member granted view-all-appointments sees the whole team', function () {
    ['team' => $team, 'owner' => $owner, 'member' => $member] = apiDashboardTeam();
    $member->teamMembership($team)->update(['permissions' => [TeamPermission::ViewAllAppointments->value]]);
    Appointment::factory()->count(2)->create(['team_id' => $team->id, 'specialist_id' => $owner->id, 'start_at' => now()->addDay()]);
    Sanctum::actingAs($member);

    $this->getJson(route('api.v1.dashboard'))
        ->assertOk()
        ->assertJsonPath('data.sees_all_appointments', true)
        ->assertJsonPath('data.stats.upcoming', 2);
});

test('another team\'s bookings are never counted', function () {
    ['team' => $team, 'owner' => $owner] = apiDashboardTeam();
    Appointment::factory()->count(3)->create(['start_at' => now()->addDay()]);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.dashboard'))
        ->assertOk()
        ->assertJsonPath('data.stats.upcoming', 0)
        ->assertJsonCount(0, 'data.upcoming_appointments');
});

test('the week trend counts bookings per day in the team timezone', function () {
    $this->travelTo(CarbonImmutable::parse('2026-11-09 08:00', 'Asia/Baku'));
    ['team' => $team, 'owner' => $owner] = apiDashboardTeam();
    // 23:30 in Baku on the 10th is still the 10th locally, though the 10th 19:30 UTC.
    Appointment::factory()->count(2)->create([
        'team_id' => $team->id,
        'specialist_id' => $owner->id,
        'start_at' => CarbonImmutable::parse('2026-11-10 23:30', 'Asia/Baku')->utc(),
    ]);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.dashboard'))
        ->assertOk()
        ->assertJsonCount(7, 'data.weekly_trend')
        ->assertJsonPath('data.weekly_trend.0', ['date' => '2026-11-09', 'count' => 0, 'is_today' => true])
        ->assertJsonPath('data.weekly_trend.1', ['date' => '2026-11-10', 'count' => 2, 'is_today' => false]);
});

test('members get their own week of working hours', function () {
    $this->travelTo(CarbonImmutable::parse('2026-11-09 10:00', 'Asia/Baku'));
    ['team' => $team, 'member' => $member] = apiDashboardTeam();
    ScheduleSlot::factory()->create([
        'user_id' => $member->id,
        'team_id' => $team->id,
        'date' => '2026-11-09',
        'start_time' => '09:00',
        'end_time' => '17:00',
    ]);
    Sanctum::actingAs($member);

    $this->getJson(route('api.v1.dashboard'))
        ->assertOk()
        ->assertJsonPath('data.schedule.total_minutes', 480)
        ->assertJsonPath('data.schedule.open_now', true)
        ->assertJsonPath('data.schedule.days.0', ['date' => '2026-11-09', 'minutes' => 480, 'is_today' => true]);
});
