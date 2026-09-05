<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;

/**
 * Set up a team with an owner and a member, both acting on the same team.
 *
 * @return array{owner: User, member: User, team: Team}
 */
function ownershipTransferSetup(): array
{
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $owner->switchTeam($team);
    $member->switchTeam($team);

    return ['owner' => $owner, 'member' => $member, 'team' => $team];
}

test('the owner can transfer ownership to another member', function () {
    ['owner' => $owner, 'member' => $member, 'team' => $team] = ownershipTransferSetup();

    $this
        ->actingAs($owner)
        ->post(route('company.business.owner.transfer'), [
            'user_id' => $member->id,
            'password' => 'password',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($member->fresh()->teamRole($team))->toBe(TeamRole::Owner);
    expect($owner->fresh()->teamRole($team))->toBe(TeamRole::Admin);
});

test('transferring ownership requires the correct password', function () {
    ['owner' => $owner, 'member' => $member, 'team' => $team] = ownershipTransferSetup();

    $this
        ->actingAs($owner)
        ->post(route('company.business.owner.transfer'), [
            'user_id' => $member->id,
            'password' => 'wrong-password',
        ])
        ->assertSessionHasErrors('password');

    expect($owner->fresh()->teamRole($team))->toBe(TeamRole::Owner);
    expect($member->fresh()->teamRole($team))->toBe(TeamRole::Member);
});

test('a member cannot transfer ownership', function () {
    ['member' => $member, 'team' => $team] = ownershipTransferSetup();

    $this
        ->actingAs($member)
        ->post(route('company.business.owner.transfer'), [
            'user_id' => $member->id,
            'password' => 'password',
        ])
        ->assertForbidden();
});

test('ownership cannot be transferred to a non member', function () {
    ['owner' => $owner] = ownershipTransferSetup();
    $outsider = User::factory()->create();

    $this
        ->actingAs($owner)
        ->post(route('company.business.owner.transfer'), [
            'user_id' => $outsider->id,
            'password' => 'password',
        ])
        ->assertSessionHasErrors('user_id');
});
