<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;

/**
 * Attach a fresh user to the team with the given role and return them.
 */
function teamMemberWithRole(Team $team, TeamRole $role): User
{
    $user = User::factory()->create();
    $team->members()->attach($user, ['role' => $role->value]);

    return $user;
}

/**
 * The company-management GET routes that require an admin or owner.
 *
 * @return array<string, array{string}>
 */
dataset('admin only company pages', [
    'company dashboard' => ['company.index'],
    'brand' => ['company.brand.index'],
    'business general' => ['company.business.edit'],
    'business members' => ['company.business.members.index'],
    'services' => ['company.services.index'],
    'locations' => ['company.locations.index'],
]);

test('members are forbidden from company management pages', function (string $routeName) {
    $team = Team::factory()->create();
    $member = teamMemberWithRole($team, TeamRole::Member);

    $this
        ->actingAs($member)
        ->get(route($routeName, ['current_team' => $team->slug]))
        ->assertForbidden();
})->with('admin only company pages');

test('admins can view company management pages', function (string $routeName) {
    $team = Team::factory()->create();
    $admin = teamMemberWithRole($team, TeamRole::Admin);

    $this
        ->actingAs($admin)
        ->get(route($routeName, ['current_team' => $team->slug]))
        ->assertOk();
})->with('admin only company pages');

test('members cannot create services or locations', function () {
    $team = Team::factory()->create();
    $member = teamMemberWithRole($team, TeamRole::Member);

    $this
        ->actingAs($member)
        ->post(route('company.services.store', ['current_team' => $team->slug]), [])
        ->assertForbidden();

    $this
        ->actingAs($member)
        ->post(route('company.locations.store', ['current_team' => $team->slug]), [])
        ->assertForbidden();
});
