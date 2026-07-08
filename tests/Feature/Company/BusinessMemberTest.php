<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;

test('owners can add a team member directly', function () {
    $owner = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($owner)
        ->post(route('company.business.members.store', ['current_team' => $team->slug]), [
            'name' => 'Jane',
            'surname' => 'Doe',
            'job_title' => 'Stylist',
            'email' => 'jane@example.com',
            'password' => 'password123',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $member = User::where('email', 'jane@example.com')->first();

    expect($member)->not->toBeNull();
    expect($member->name)->toEqual('Jane Doe');
    expect($member->email_verified_at)->not->toBeNull();
    expect($member->profile->job_title)->toEqual('Stylist');
    expect($member->belongsToTeam($team))->toBeTrue();
    expect($team->members()->where('user_id', $member->id)->first()->pivot->role->value)
        ->toEqual(TeamRole::Member->value);

    expect($member->personalTeam())->toBeNull();
    expect($member->teams()->count())->toBe(1);
});

test('admins can add a team member directly', function () {
    $admin = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);

    $this
        ->actingAs($admin)
        ->post(route('company.business.members.store', ['current_team' => $team->slug]), [
            'name' => 'John',
            'surname' => 'Smith',
            'email' => 'john@example.com',
            'password' => 'password123',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect(User::where('email', 'john@example.com')->exists())->toBeTrue();
});

test('members cannot add a team member directly', function () {
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($member)
        ->post(route('company.business.members.store', ['current_team' => $team->slug]), [
            'name' => 'Jane',
            'email' => 'jane@example.com',
            'password' => 'password123',
        ])
        ->assertForbidden();

    expect(User::where('email', 'jane@example.com')->exists())->toBeFalse();
});

test('a member cannot be added with an existing email', function () {
    $owner = User::factory()->create();
    $existing = User::factory()->create(['email' => 'taken@example.com']);
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($owner)
        ->post(route('company.business.members.store', ['current_team' => $team->slug]), [
            'name' => 'Jane',
            'email' => 'taken@example.com',
            'password' => 'password123',
        ])
        ->assertSessionHasErrors('email');
});

test('team member roles can be updated by owners', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($owner)
        ->patch(route('company.business.members.update', ['current_team' => $team->slug, 'user' => $member]), [
            'role' => TeamRole::Admin->value,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($team->members()->where('user_id', $member->id)->first()->pivot->role->value)->toEqual(TeamRole::Admin->value);
});

test('team member roles cannot be updated by non owners', function () {
    $owner = User::factory()->create();
    $admin = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($admin)
        ->patch(route('company.business.members.update', ['current_team' => $team->slug, 'user' => $member]), [
            'role' => TeamRole::Admin->value,
        ])
        ->assertForbidden();
});

test('team members can be removed by owners', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($owner)
        ->delete(route('company.business.members.destroy', ['current_team' => $team->slug, 'user' => $member]))
        ->assertRedirect();

    expect($member->fresh()->belongsToTeam($team))->toBeFalse();
});

test('team members cannot be removed by non owners', function () {
    $owner = User::factory()->create();
    $admin = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($admin)
        ->delete(route('company.business.members.destroy', ['current_team' => $team->slug, 'user' => $member]))
        ->assertForbidden();
});

test('team owner cannot be removed', function () {
    $owner = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($owner)
        ->delete(route('company.business.members.destroy', ['current_team' => $team->slug, 'user' => $owner]))
        ->assertForbidden();

    expect($owner->fresh()->belongsToTeam($team))->toBeTrue();
});

test('team member role cannot be set to owner', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($owner)
        ->patch(route('company.business.members.update', ['current_team' => $team->slug, 'user' => $member]), [
            'role' => TeamRole::Owner->value,
        ])
        ->assertSessionHasErrors('role');

    expect($team->members()->where('user_id', $member->id)->first()->pivot->role->value)->toEqual(TeamRole::Member->value);
});

test('removed member current team is set to personal team', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $personalTeam = $member->personalTeam();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $member->update(['current_team_id' => $team->id]);

    $this
        ->actingAs($owner)
        ->delete(route('company.business.members.destroy', ['current_team' => $team->slug, 'user' => $member]));

    expect($member->fresh()->current_team_id)->toEqual($personalTeam->id);
});

test('a member added directly can be removed without a personal team', function () {
    $owner = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($owner)
        ->post(route('company.business.members.store', ['current_team' => $team->slug]), [
            'name' => 'Jane',
            'email' => 'jane@example.com',
            'password' => 'password123',
        ])
        ->assertSessionHasNoErrors();

    $member = User::where('email', 'jane@example.com')->first();

    expect($member->personalTeam())->toBeNull();
    expect($member->fresh()->current_team_id)->toEqual($team->id);

    $this
        ->actingAs($owner)
        ->delete(route('company.business.members.destroy', ['current_team' => $team->slug, 'user' => $member]))
        ->assertRedirect();

    expect($member->fresh()->belongsToTeam($team))->toBeFalse();
});
