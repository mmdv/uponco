<?php

use App\Enums\BusinessCategory;
use App\Enums\TeamRole;
use App\Enums\TeamType;
use App\Models\Team;
use App\Models\User;

/**
 * Create a user owning a team that has not completed the onboarding gate.
 *
 * @return array{0: User, 1: Team}
 */
function incompleteTeamOwner(): array
{
    $user = User::factory()->create();
    $team = Team::factory()->create([
        'name' => null,
        'type' => null,
        'timezone' => null,
        'business_category' => null,
        'is_personal' => true,
    ]);
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    return [$user, $team];
}

test('an incomplete team is redirected from the dashboard to the onboard gate', function () {
    [$user, $team] = incompleteTeamOwner();

    $this
        ->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('onboard.show'));
});

test('the onboard gate renders for an incomplete team', function () {
    [$user, $team] = incompleteTeamOwner();

    $this
        ->actingAs($user)
        ->get(route('onboard.show'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('onboard')
            ->has('timezones')
            ->has('businessCategories')
            ->where('userName', $user->name)
        );
});

test('completing onboarding updates the team and redirects to the dashboard', function () {
    [$user, $team] = incompleteTeamOwner();

    $response = $this
        ->actingAs($user)
        ->patch(route('onboard.update'), [
            'name' => 'Acme Studio',
            'type' => TeamType::Organisation->value,
            'business_category' => BusinessCategory::Hairdresser->value,
            'timezone' => 'America/New_York',
        ]);

    $team->refresh();

    expect($team->name)->toBe('Acme Studio');
    expect($team->type)->toBe(TeamType::Organisation);
    expect($team->business_category)->toBe(BusinessCategory::Hairdresser);
    expect($team->timezone)->toBe('America/New_York');
    expect($team->slug)->toBe('acme-studio');

    $response->assertRedirect(route('dashboard'));
});

test('an individual can complete onboarding under their own name', function () {
    [$user, $team] = incompleteTeamOwner();

    $this
        ->actingAs($user)
        ->patch(route('onboard.update'), [
            'name' => 'Dr Jane Doe',
            'type' => TeamType::Individual->value,
            'business_category' => BusinessCategory::Psychotherapist->value,
            'timezone' => 'Europe/Berlin',
        ])
        ->assertRedirect(route('dashboard'));

    $team->refresh();

    expect($team->type)->toBe(TeamType::Individual);
    expect($team->business_category)->toBe(BusinessCategory::Psychotherapist);
});

test('onboarding rejects an unknown team type', function () {
    [$user, $team] = incompleteTeamOwner();

    $this
        ->actingAs($user)
        ->from(route('onboard.show'))
        ->patch(route('onboard.update'), [
            'name' => 'Acme Studio',
            'type' => 'sole_trader',
            'business_category' => BusinessCategory::Hairdresser->value,
            'timezone' => 'America/New_York',
        ])
        ->assertSessionHasErrors('type');
});

test('the other category requires its own description', function () {
    [$user, $team] = incompleteTeamOwner();

    $this
        ->actingAs($user)
        ->from(route('onboard.show'))
        ->patch(route('onboard.update'), [
            'name' => 'Acme Studio',
            'type' => TeamType::Individual->value,
            'business_category' => BusinessCategory::Other->value,
            'timezone' => 'America/New_York',
        ])
        ->assertSessionHasErrors('business_category_other');

    expect($team->fresh()->business_category)->toBeNull();
});

test('the other category is stored alongside its description', function () {
    [$user, $team] = incompleteTeamOwner();

    $this
        ->actingAs($user)
        ->patch(route('onboard.update'), [
            'name' => 'Acme Studio',
            'type' => TeamType::Individual->value,
            'business_category' => BusinessCategory::Other->value,
            'business_category_other' => 'Sound therapist',
            'timezone' => 'America/New_York',
        ])
        ->assertRedirect(route('dashboard'));

    $team->refresh();

    expect($team->business_category)->toBe(BusinessCategory::Other);
    expect($team->business_category_other)->toBe('Sound therapist');
});

test('a listed category clears any description sent with it', function () {
    [$user, $team] = incompleteTeamOwner();
    $team->update(['business_category_other' => 'Sound therapist']);

    $this
        ->actingAs($user)
        ->patch(route('onboard.update'), [
            'name' => 'Acme Studio',
            'type' => TeamType::Organisation->value,
            'business_category' => BusinessCategory::Spa->value,
            'business_category_other' => 'Sound therapist',
            'timezone' => 'America/New_York',
        ])
        ->assertRedirect(route('dashboard'));

    expect($team->fresh()->business_category_other)->toBeNull();
});

test('a completed team can no longer access the onboard gate', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->get(route('onboard.show'))
        ->assertRedirect(route('dashboard'));
});

test('onboarding requires a name, type, category and timezone', function () {
    [$user, $team] = incompleteTeamOwner();

    $this
        ->actingAs($user)
        ->from(route('onboard.show'))
        ->patch(route('onboard.update'), [])
        ->assertSessionHasErrors(['name', 'type', 'business_category', 'timezone']);
});

test('onboarding rejects a company name that is already taken', function () {
    Team::factory()->create(['name' => 'Taken Name']);
    [$user, $team] = incompleteTeamOwner();

    $this
        ->actingAs($user)
        ->from(route('onboard.show'))
        ->patch(route('onboard.update'), [
            'name' => 'Taken Name',
            'type' => TeamType::Organisation->value,
            'business_category' => BusinessCategory::Hairdresser->value,
            'timezone' => 'America/New_York',
        ])
        ->assertSessionHasErrors('name');

    expect($team->fresh()->name)->toBeNull();
});

test('members without update permission cannot complete onboarding', function () {
    [, $team] = incompleteTeamOwner();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($team);

    $this
        ->actingAs($member)
        ->patch(route('onboard.update'), [
            'name' => 'Member Co',
            'type' => TeamType::Organisation->value,
            'business_category' => BusinessCategory::Hairdresser->value,
            'timezone' => 'America/New_York',
        ])
        ->assertForbidden();
});
