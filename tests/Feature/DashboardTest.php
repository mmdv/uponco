<?php

use App\Enums\OnboardingStepStatus;
use App\Enums\TeamRole;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\OnboardingProgress;
use App\Models\ScheduleSlot;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;

/**
 * Create a team with a regular member so the onboarding wizard is skipped and
 * the dashboard renders its stats and upcoming appointments instead.
 *
 * @return array{0: User, 1: Team}
 */
function dashboardMember(): array
{
    $member = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    return [$member, $team];
}

/**
 * Create a team owner whose onboarding is already complete so the dashboard
 * renders its stats and upcoming appointments instead of the wizard.
 *
 * @return array{0: User, 1: Team}
 */
function dashboardOwner(): array
{
    $owner = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    OnboardingProgress::create([
        'team_id' => $team->id,
        'user_id' => $owner->id,
        'services_status' => OnboardingStepStatus::Skipped,
        'profile_status' => OnboardingStepStatus::Completed,
        'schedule_status' => OnboardingStepStatus::Completed,
        'completed_at' => now(),
    ]);

    return [$owner, $team];
}

test('guests are redirected to the login page', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this
        ->actingAs($user)
        ->get(route('dashboard'));

    $response->assertOk();
});

test('the dashboard reports booking and customer stats when onboarding is hidden', function () {
    [$member, $team] = dashboardMember();

    Customer::factory()->count(2)->create(['team_id' => $team->id]);
    Appointment::factory()->count(3)->create([
        'team_id' => $team->id,
        'specialist_id' => $member->id,
        'start_at' => now()->addDay(),
        'end_at' => now()->addDay()->addHour(),
    ]);
    Appointment::factory()->create([
        'team_id' => $team->id,
        'specialist_id' => $member->id,
        'start_at' => now()->subDay(),
        'end_at' => now()->subDay()->addHour(),
    ]);

    $this
        ->actingAs($member)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('onboarding', null)
            ->where('stats.customers', 2)
            ->where('stats.totalBookings', 4)
            ->where('stats.upcoming', 3)
            ->has('upcomingAppointments', 3)
            ->has('formOptions.appointments')
            ->has('formOptions.services')
            ->has('formOptions.locations')
        );
});

test('the dashboard exposes the booking options and slots the embedded booking preview needs', function () {
    [$owner, $team] = dashboardOwner();

    $service = Service::factory()->create(['team_id' => $team->id, 'duration' => 60]);
    $service->specialists()->attach($owner);

    ScheduleSlot::create([
        'team_id' => $team->id,
        'user_id' => $owner->id,
        'date' => now()->addDay()->toDateString(),
        'start_time' => '09:00',
        'end_time' => '11:00',
    ]);

    // The preview renders the public booking flow with these props, and its
    // slot picker reloads `availableSlots` from the dashboard route itself.
    $this
        ->actingAs($owner)
        ->get(route('dashboard', [
            'current_team' => $team->slug,
            'service_id' => $service->id,
            'specialist_id' => $owner->id,
            'date' => now()->addDay()->toDateString(),
        ]), [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => app(HandleInertiaRequests::class)->version(request()),
            'X-Inertia-Partial-Component' => 'dashboard',
            'X-Inertia-Partial-Data' => 'availableSlots',
        ])
        ->assertOk()
        ->assertJsonStructure(['props' => ['availableSlots']]);

    $this
        ->actingAs($owner)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('timezone')
            ->has('formOptions.appointments.services')
            ->has('formOptions.appointments.locations')
            ->has('formOptions.appointments.specialists')
        );
});

test('members only see their own bookings in the dashboard stats and upcoming list', function () {
    [$member, $team] = dashboardMember();
    $other = User::factory()->create();
    $team->members()->attach($other, ['role' => TeamRole::Member->value]);

    // The member's own bookings: one upcoming, one past.
    Appointment::factory()->create([
        'team_id' => $team->id,
        'specialist_id' => $member->id,
        'start_at' => now()->addDay(),
        'end_at' => now()->addDay()->addHour(),
    ]);
    Appointment::factory()->create([
        'team_id' => $team->id,
        'specialist_id' => $member->id,
        'start_at' => now()->subDay(),
        'end_at' => now()->subDay()->addHour(),
    ]);

    // Another specialist's bookings must not leak into the member's dashboard.
    Appointment::factory()->count(3)->create([
        'team_id' => $team->id,
        'specialist_id' => $other->id,
        'start_at' => now()->addDay(),
        'end_at' => now()->addDay()->addHour(),
    ]);

    $this
        ->actingAs($member)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('stats.totalBookings', 2)
            ->where('stats.upcoming', 1)
            ->has('upcomingAppointments', 1)
        );
});

test('admins see every specialist booking in the dashboard stats and upcoming list', function () {
    [$owner, $team] = dashboardOwner();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    Appointment::factory()->create([
        'team_id' => $team->id,
        'specialist_id' => $owner->id,
        'start_at' => now()->addDay(),
        'end_at' => now()->addDay()->addHour(),
    ]);
    Appointment::factory()->count(2)->create([
        'team_id' => $team->id,
        'specialist_id' => $member->id,
        'start_at' => now()->addDay(),
        'end_at' => now()->addDay()->addHour(),
    ]);

    $this
        ->actingAs($owner)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('onboarding', null)
            ->where('stats.totalBookings', 3)
            ->where('stats.upcoming', 3)
            ->has('upcomingAppointments', 3)
        );
});

test('the dashboard reports a seven day booking trend with today counted', function () {
    // Anchor "now" to mid-morning so today's bookings can never spill into the
    // next day, and pin the timezone (the factory picks a random one) so the
    // daily buckets are computed against a known offset.
    $this->travelTo(now()->startOfDay()->addHours(9));

    [$member, $team] = dashboardMember();
    $team->update(['timezone' => 'UTC']);

    Appointment::factory()->count(2)->create([
        'team_id' => $team->id,
        'specialist_id' => $member->id,
        'start_at' => now()->addHours(2),
        'end_at' => now()->addHours(3),
    ]);
    Appointment::factory()->create([
        'team_id' => $team->id,
        'specialist_id' => $member->id,
        'start_at' => now()->addDays(2)->setTime(10, 0),
        'end_at' => now()->addDays(2)->setTime(11, 0),
    ]);

    $this
        ->actingAs($member)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('weeklyTrend', 7)
            ->where('weeklyTrend.0.isToday', true)
            ->where('weeklyTrend.0.count', 2)
            ->where('weeklyTrend.2.count', 1)
        );
});

test('members only see their own bookings in the week ahead trend', function () {
    $this->travelTo(now()->startOfDay()->addHours(9));

    [$member, $team] = dashboardMember();
    $team->update(['timezone' => 'UTC']);

    $other = User::factory()->create();
    $team->members()->attach($other, ['role' => TeamRole::Member->value]);

    // The member's own booking today.
    Appointment::factory()->create([
        'team_id' => $team->id,
        'specialist_id' => $member->id,
        'start_at' => now()->addHours(2),
        'end_at' => now()->addHours(3),
    ]);

    // Another specialist's bookings today must not appear in the member's trend.
    Appointment::factory()->count(3)->create([
        'team_id' => $team->id,
        'specialist_id' => $other->id,
        'start_at' => now()->addHours(2),
        'end_at' => now()->addHours(3),
    ]);

    $this
        ->actingAs($member)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('weeklyTrend.0.count', 1)
        );
});

test('the dashboard omits the booking trend while the onboarding wizard is shown', function () {
    $owner = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($owner)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('weeklyTrend', null));
});

test('the dashboard omits stats while the onboarding wizard is shown', function () {
    $owner = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($owner)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('stats', null)
            ->where('upcomingAppointments', null)
            ->where('formOptions', null)
            ->has('onboarding')
        );
});
