<?php

use App\Enums\OnboardingStep;
use App\Enums\OnboardingStepStatus;
use App\Enums\TeamRole;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\OnboardingProgress;
use App\Models\ScheduleSlot;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;

/**
 * Create a user that owns a fully set-up team (so it clears the onboarding
 * gate) but has not yet completed the setup flow's steps.
 *
 * @return array{0: User, 1: Team}
 */
function onboardingOwner(array $teamAttributes = []): array
{
    $user = User::factory()->create();
    $team = Team::factory()->create($teamAttributes);
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    return [$user, $team];
}

function dashboardRoute(Team $team): string
{
    return route('dashboard');
}

function onboardingRoute(Team $team): string
{
    return route('onboarding.show');
}

function onboardingStepRoute(Team $team, OnboardingStep $step): string
{
    return route('onboarding.steps.update', [
        'step' => $step->value,
    ]);
}

/** Satisfy every step's underlying data so onboarding can complete. */
function completeOnboardingData(User $user, Team $team): void
{
    $user->profile()->create(['job_title' => 'Stylist']);
    ScheduleSlot::factory()->create(['team_id' => $team->id, 'user_id' => $user->id]);
    Service::factory()->create(['team_id' => $team->id]);
}

test('the dashboard sends owners to onboarding until it is finished', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->get(dashboardRoute($team))
        ->assertRedirect(onboardingRoute($team));
});

test('owners see the setup flow with all three steps', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->get(onboardingRoute($team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('onboarding')
            ->where('completed', false)
            ->has('steps', 3)
            ->where('currentStep', 'services')
            ->where('steps.0.key', 'services')
        );
});

test('regular members go straight to the dashboard', function () {
    [, $team] = onboardingOwner();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($team);

    $this
        ->actingAs($member)
        ->get(dashboardRoute($team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard'));
});

test('regular members cannot open the setup flow', function () {
    [, $team] = onboardingOwner();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($team);

    $this
        ->actingAs($member)
        ->get(onboardingRoute($team))
        ->assertForbidden();
});

test('steps auto-complete when their data already exists', function () {
    [$user, $team] = onboardingOwner();
    $user->profile()->create(['job_title' => 'Stylist']);

    $this
        ->actingAs($user)
        ->get(onboardingRoute($team))
        ->assertInertia(fn ($page) => $page
            ->where('steps.0.status', 'pending')    // services
            ->where('steps.1.status', 'completed')  // profile
            ->where('steps.2.status', 'pending')    // schedule
        );

    $progress = OnboardingProgress::firstWhere('user_id', $user->id);
    expect($progress->statusFor(OnboardingStep::Profile))->toBe(OnboardingStepStatus::Completed);
    expect($progress->statusFor(OnboardingStep::Services))->toBe(OnboardingStepStatus::Pending);
});

test('no step can be skipped', function () {
    [$user, $team] = onboardingOwner();

    foreach (OnboardingStep::cases() as $step) {
        $this
            ->actingAs($user)
            ->patch(onboardingStepRoute($team, $step), [
                'status' => OnboardingStepStatus::Skipped->value,
            ])
            ->assertSessionHasErrors('status');
    }

    expect(OnboardingProgress::firstWhere('user_id', $user->id)?->statusFor(OnboardingStep::Services))
        ->not->toBe(OnboardingStepStatus::Skipped);
});

test('completing the services step requires a saved service', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->patch(onboardingStepRoute($team, OnboardingStep::Services), [
            'status' => OnboardingStepStatus::Completed->value,
        ])
        ->assertSessionHasErrors('status');

    Service::factory()->create(['team_id' => $team->id]);

    $this
        ->actingAs($user)
        ->patch(onboardingStepRoute($team, OnboardingStep::Services), [
            'status' => OnboardingStepStatus::Completed->value,
        ])
        ->assertSessionHasNoErrors();

    expect(OnboardingProgress::firstWhere('user_id', $user->id)->statusFor(OnboardingStep::Services))
        ->toBe(OnboardingStepStatus::Completed);
});

test('the services step completes for an online service with no locations', function () {
    [$user, $team] = onboardingOwner();

    Service::factory()->create([
        'team_id' => $team->id,
        'delivery_type' => 'online',
        'online_meeting_provider' => 'google_meet',
    ]);

    $this
        ->actingAs($user)
        ->patch(onboardingStepRoute($team, OnboardingStep::Services), [
            'status' => OnboardingStepStatus::Completed->value,
        ])
        ->assertSessionHasNoErrors();

    expect($team->locations()->count())->toBe(0);
    expect(OnboardingProgress::firstWhere('user_id', $user->id)->statusFor(OnboardingStep::Services))
        ->toBe(OnboardingStepStatus::Completed);
});

test('completing the schedule step requires saved work hours', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->patch(onboardingStepRoute($team, OnboardingStep::Schedule), [
            'status' => OnboardingStepStatus::Completed->value,
        ])
        ->assertSessionHasErrors('status');

    ScheduleSlot::factory()->create(['team_id' => $team->id, 'user_id' => $user->id]);

    $this
        ->actingAs($user)
        ->patch(onboardingStepRoute($team, OnboardingStep::Schedule), [
            'status' => OnboardingStepStatus::Completed->value,
        ])
        ->assertSessionHasNoErrors();

    expect(OnboardingProgress::firstWhere('user_id', $user->id)->statusFor(OnboardingStep::Schedule))
        ->toBe(OnboardingStepStatus::Completed);
});

test('the payload includes the empty schedule and google status', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->get(onboardingRoute($team))
        ->assertInertia(fn ($page) => $page
            ->where('steps.2.key', 'schedule')
            ->where('steps.2.mandatory', true)
            ->where('schedule', [])
            ->where('hasSchedule', false)
            ->where('services.google.connected', false)
        );
});

test('the schedule payload carries the owner\'s own slots for the default range', function () {
    [$user, $team] = onboardingOwner();

    // The default range is the current month's calendar grid, so anchor the day
    // inside the month rather than a fixed number of days from today.
    $date = now()->startOfMonth()->addDays(9)->format('Y-m-d');

    ScheduleSlot::factory()->create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'date' => $date,
        'start_time' => '09:00',
        'end_time' => '17:00',
    ]);

    // A colleague's hours belong to their own schedule screen, not this step.
    $colleague = User::factory()->create();
    $team->members()->attach($colleague, ['role' => TeamRole::Member->value]);
    ScheduleSlot::factory()->create([
        'team_id' => $team->id,
        'user_id' => $colleague->id,
        'date' => $date,
    ]);

    $this
        ->actingAs($user)
        ->get(onboardingRoute($team))
        ->assertInertia(fn ($page) => $page
            ->where('hasSchedule', true)
            ->has('schedule', 1)
            ->where('schedule.'.$date, [['start' => '09:00', 'end' => '17:00']])
        );
});

test('the schedule payload follows the range the editor asks for', function () {
    [$user, $team] = onboardingOwner();

    $date = now()->addMonths(2)->startOfMonth()->addDays(9)->format('Y-m-d');

    ScheduleSlot::factory()->create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'date' => $date,
        'start_time' => '10:00',
        'end_time' => '14:00',
    ]);

    // Moving the week reloads the slot map alone, which is a partial visit.
    $this
        ->actingAs($user)
        ->get(onboardingRoute($team).'?from='.now()->addMonths(2)->startOfMonth()->format('Y-m-d')
            .'&to='.now()->addMonths(2)->endOfMonth()->format('Y-m-d'), [
                'X-Inertia' => 'true',
                'X-Inertia-Version' => (new HandleInertiaRequests)->version(request()),
                'X-Inertia-Partial-Component' => 'onboarding',
                'X-Inertia-Partial-Data' => 'schedule',
            ])
        ->assertOk()
        ->assertJsonPath('props.schedule.'.$date, [['start' => '10:00', 'end' => '14:00']])
        ->assertJsonMissingPath('props.services');
});

test('the services payload carries everything the service screens need', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->get(onboardingRoute($team))
        ->assertInertia(fn ($page) => $page
            ->has('services.categories')
            ->has('services.services')
            ->has('services.serviceOptions')
            ->has('services.locations')
            ->has('services.specialists')
            ->has('services.countries')
            ->has('services.priceTypes')
            ->has('services.currencies')
            ->has('services.serviceTypes')
            ->has('services.google')
            // Locations are created from inside the flow now.
            ->missing('locations')
        );
});

test('an invalid status is rejected', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->patch(onboardingStepRoute($team, OnboardingStep::Services), [
            'status' => 'pending',
        ])
        ->assertSessionHasErrors('status');
});

test('completing a step requires the underlying data', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->patch(onboardingStepRoute($team, OnboardingStep::Profile), [
            'status' => OnboardingStepStatus::Completed->value,
        ])
        ->assertSessionHasErrors('status');
});

test('regular members cannot update onboarding steps', function () {
    [, $team] = onboardingOwner();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($team);

    $this
        ->actingAs($member)
        ->patch(onboardingStepRoute($team, OnboardingStep::Services), [
            'status' => OnboardingStepStatus::Completed->value,
        ])
        ->assertForbidden();
});

test('the flow reports itself complete once every step is resolved', function () {
    [$user, $team] = onboardingOwner();
    completeOnboardingData($user, $team);

    // The closing screen still needs the page, so it keeps rendering — only the
    // completed flag changes.
    $this
        ->actingAs($user)
        ->get(onboardingRoute($team))
        ->assertInertia(fn ($page) => $page
            ->component('onboarding')
            ->where('completed', true)
        );

    expect(OnboardingProgress::firstWhere('user_id', $user->id)->completed_at)->not->toBeNull();
});

test('the dashboard stops redirecting once onboarding is complete', function () {
    [$user, $team] = onboardingOwner();
    completeOnboardingData($user, $team);

    $this
        ->actingAs($user)
        ->get(dashboardRoute($team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard'));
});
