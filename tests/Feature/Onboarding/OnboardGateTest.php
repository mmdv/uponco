<?php

use App\Enums\BusinessCategory;
use App\Enums\TeamRole;
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
        );
});

test('completing onboarding updates the team and redirects to the dashboard', function () {
    [$user, $team] = incompleteTeamOwner();

    $response = $this
        ->actingAs($user)
        ->patch(route('onboard.update'), [
            'name' => 'Acme Studio',
            'business_category' => BusinessCategory::Hairdresser->value,
            'timezone' => 'America/New_York',
        ]);

    $team->refresh();

    expect($team->name)->toBe('Acme Studio');
    expect($team->business_category)->toBe(BusinessCategory::Hairdresser);
    expect($team->timezone)->toBe('America/New_York');
    expect($team->slug)->toBe('acme-studio');

    $response->assertRedirect(route('dashboard'));
});

test('a completed team can no longer access the onboard gate', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->get(route('onboard.show'))
        ->assertRedirect(route('dashboard'));
});

test('onboarding requires a name, category and timezone', function () {
    [$user, $team] = incompleteTeamOwner();

    $this
        ->actingAs($user)
        ->from(route('onboard.show'))
        ->patch(route('onboard.update'), [])
        ->assertSessionHasErrors(['name', 'business_category', 'timezone']);
});

test('onboarding rejects a company name that is already taken', function () {
    Team::factory()->create(['name' => 'Taken Name']);
    [$user, $team] = incompleteTeamOwner();

    $this
        ->actingAs($user)
        ->from(route('onboard.show'))
        ->patch(route('onboard.update'), [
            'name' => 'Taken Name',
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
            'business_category' => BusinessCategory::Hairdresser->value,
            'timezone' => 'America/New_York',
        ])
        ->assertForbidden();
});
