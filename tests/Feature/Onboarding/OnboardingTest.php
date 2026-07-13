<?php

use App\Enums\OnboardingStep;
use App\Enums\OnboardingStepStatus;
use App\Enums\TeamRole;
use App\Models\OnboardingProgress;
use App\Models\ScheduleSlot;
use App\Models\Team;
use App\Models\User;

/**
 * Create a user that owns a fully set-up team (so it clears the onboarding
 * gate) but has not yet completed the dashboard wizard steps.
 *
 * @return array{0: User, 1: Team}
 */
function onboardingOwner(array $teamAttributes = []): array
{
    $user = User::factory()->create();
    $team = Team::factory()->create($teamAttributes);
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    return [$user, $team];
}

function dashboardRoute(Team $team): string
{
    return route('dashboard', ['current_team' => $team->slug]);
}

function onboardingStepRoute(Team $team, OnboardingStep $step): string
{
    return route('onboarding.steps.update', [
        'current_team' => $team->slug,
        'step' => $step->value,
    ]);
}

test('owners see the onboarding wizard with all four steps', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->get(dashboardRoute($team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('onboarding')
            ->has('onboarding.steps', 4)
            ->where('onboarding.currentStep', 'locations')
        );
});

test('regular members do not see the onboarding wizard', function () {
    [, $team] = onboardingOwner();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($member)
        ->get(dashboardRoute($team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('onboarding', null)
        );
});

test('mandatory steps auto-complete when their data already exists', function () {
    [$user, $team] = onboardingOwner();
    $user->profile()->create(['name' => $user->name, 'job_title' => 'Stylist']);

    $this
        ->actingAs($user)
        ->get(dashboardRoute($team))
        ->assertInertia(fn ($page) => $page
            ->where('onboarding.steps.0.status', 'pending')    // locations
            ->where('onboarding.steps.1.status', 'pending')    // services
            ->where('onboarding.steps.2.status', 'completed')  // profile
        );

    $progress = OnboardingProgress::firstWhere('user_id', $user->id);
    expect($progress->statusFor(OnboardingStep::Profile))->toBe(OnboardingStepStatus::Completed);
    expect($progress->statusFor(OnboardingStep::Locations))->toBe(OnboardingStepStatus::Pending);
});

test('an optional step can be skipped and advances the current step', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->patch(onboardingStepRoute($team, OnboardingStep::Locations), [
            'status' => OnboardingStepStatus::Skipped->value,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $progress = OnboardingProgress::firstWhere('user_id', $user->id);
    expect($progress->statusFor(OnboardingStep::Locations))->toBe(OnboardingStepStatus::Skipped);
    expect($progress->current_step)->toBe(OnboardingStep::Services);
});

test('a mandatory step cannot be skipped', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->patch(onboardingStepRoute($team, OnboardingStep::Profile), [
            'status' => OnboardingStepStatus::Skipped->value,
        ])
        ->assertSessionHasErrors('status');
});

test('the schedule step is mandatory and cannot be skipped', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->patch(onboardingStepRoute($team, OnboardingStep::Schedule), [
            'status' => OnboardingStepStatus::Skipped->value,
        ])
        ->assertSessionHasErrors('status');
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

test('the onboarding payload includes schedule members and google status', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->get(dashboardRoute($team))
        ->assertInertia(fn ($page) => $page
            ->where('onboarding.steps.3.key', 'schedule')
            ->where('onboarding.steps.3.mandatory', true)
            ->has('onboarding.schedule.members', 1)
            ->has('onboarding.schedule.slots')
            ->where('onboarding.services.google.connected', false)
        );
});

test('an invalid status is rejected', function () {
    [$user, $team] = onboardingOwner();

    $this
        ->actingAs($user)
        ->patch(onboardingStepRoute($team, OnboardingStep::Locations), [
            'status' => 'pending',
        ])
        ->assertSessionHasErrors('status');
});

test('completing a mandatory step requires the underlying data', function () {
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

    $this
        ->actingAs($member)
        ->patch(onboardingStepRoute($team, OnboardingStep::Locations), [
            'status' => OnboardingStepStatus::Skipped->value,
        ])
        ->assertForbidden();
});

test('the wizard disappears once every step is resolved', function () {
    [$user, $team] = onboardingOwner();
    $user->profile()->create(['name' => $user->name, 'job_title' => 'Stylist']);
    ScheduleSlot::factory()->create(['team_id' => $team->id, 'user_id' => $user->id]);

    OnboardingProgress::create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'locations_status' => OnboardingStepStatus::Skipped,
        'services_status' => OnboardingStepStatus::Skipped,
    ]);

    $this
        ->actingAs($user)
        ->get(dashboardRoute($team))
        ->assertInertia(fn ($page) => $page->where('onboarding', null));

    expect(OnboardingProgress::firstWhere('user_id', $user->id)->completed_at)->not->toBeNull();
});
