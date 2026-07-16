<?php

use App\Enums\BusinessCategory;
use App\Enums\OnboardingStep;
use App\Enums\OnboardingStepStatus;
use App\Enums\TeamRole;
use App\Models\OnboardingProgress;
use App\Models\ScheduleSlot;
use App\Models\Team;
use App\Models\User;

/**
 * Create a user owning a team that has cleared the onboarding gate.
 *
 * @return array{0: User, 1: Team}
 */
function analyticsOwner(): array
{
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    return [$user, $team];
}

/**
 * Create a user owning a team that still needs the onboarding gate.
 *
 * @return array{0: User, 1: Team}
 */
function analyticsGateOwner(): array
{
    $user = User::factory()->create();
    $team = Team::factory()->create([
        'name' => null,
        'timezone' => null,
        'business_category' => null,
        'is_personal' => true,
    ]);
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    return [$user, $team];
}

/**
 * Get the names of the analytics events queued in the session.
 *
 * @return list<string>
 */
function queuedEventNames(): array
{
    return collect(session('analytics_events', []))
        ->pluck('name')
        ->all();
}

test('a guest page shares no analytics identity', function () {
    $this
        ->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('analytics.identity', null));
});

test('an authenticated page shares the user and their current team', function () {
    [$user, $team] = analyticsOwner();

    $this
        ->actingAs($user)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('analytics.identity.id', $user->id)
            ->where('analytics.identity.team', $team->slug)
        );
});

test('registering queues a signup event', function () {
    $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    expect(queuedEventNames())->toContain('signup_completed');
});

test('completing the onboarding gate queues an event carrying the category', function () {
    [$user, $team] = analyticsGateOwner();

    $this
        ->actingAs($user)
        ->patch(route('onboard.update', ['current_team' => $team->slug]), [
            'name' => 'Acme Salon',
            'business_category' => BusinessCategory::values()[0],
            'timezone' => 'Europe/Berlin',
        ]);

    expect(queuedEventNames())->toContain('onboarding_gate_completed');
    expect(session('analytics_events')[0]['properties'])
        ->toMatchArray([
            'business_category' => BusinessCategory::values()[0],
            'timezone' => 'Europe/Berlin',
        ]);
});

test('resolving an onboarding step queues the step and its status', function () {
    [$user, $team] = analyticsOwner();

    $this
        ->actingAs($user)
        ->patch(route('onboarding.steps.update', [
            'current_team' => $team->slug,
            'step' => OnboardingStep::Locations->value,
        ]), ['status' => OnboardingStepStatus::Skipped->value]);

    expect(session('analytics_events')[0])
        ->toMatchArray([
            'name' => 'onboarding_step_resolved',
            'properties' => [
                'step' => 'locations',
                'status' => 'skipped',
            ],
        ]);
});

test('the booking page going live is queued when the last step resolves', function () {
    [$user, $team] = analyticsOwner();
    $user->profile()->create(['name' => $user->name, 'job_title' => 'Stylist']);
    ScheduleSlot::factory()->create(['team_id' => $team->id, 'user_id' => $user->id]);

    OnboardingProgress::create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'locations_status' => OnboardingStepStatus::Skipped,
        'services_status' => OnboardingStepStatus::Skipped,
        'profile_status' => OnboardingStepStatus::Completed,
    ]);

    $this
        ->actingAs($user)
        ->patch(route('onboarding.steps.update', [
            'current_team' => $team->slug,
            'step' => OnboardingStep::Schedule->value,
        ]), ['status' => OnboardingStepStatus::Completed->value]);

    expect(queuedEventNames())->toContain('booking_page_live');
});

test('an already live booking page does not queue the event again', function () {
    [$user, $team] = analyticsOwner();
    $user->profile()->create(['name' => $user->name, 'job_title' => 'Stylist']);
    ScheduleSlot::factory()->create(['team_id' => $team->id, 'user_id' => $user->id]);

    OnboardingProgress::create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'locations_status' => OnboardingStepStatus::Skipped,
        'services_status' => OnboardingStepStatus::Skipped,
        'profile_status' => OnboardingStepStatus::Completed,
        'schedule_status' => OnboardingStepStatus::Completed,
        'completed_at' => now(),
    ]);

    $this
        ->actingAs($user)
        ->patch(route('onboarding.steps.update', [
            'current_team' => $team->slug,
            'step' => OnboardingStep::Schedule->value,
        ]), ['status' => OnboardingStepStatus::Completed->value]);

    expect(queuedEventNames())->not->toContain('booking_page_live');
});

test('a queued event reaches the next page and is then cleared', function () {
    [$user, $team] = analyticsOwner();

    $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this
        ->actingAs($user)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertInertia(fn ($page) => $page
            ->where('analytics.events.0.name', 'signup_completed')
        );

    $this
        ->actingAs($user)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertInertia(fn ($page) => $page->where('analytics.events', []));
});
