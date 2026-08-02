<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

test('team invitations can be created', function () {
    Notification::fake();

    $owner = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $owner->switchTeam($team);

    $this
        ->actingAs($owner)
        ->post(route('company.business.invitations.store'), [
            'email' => 'invited@example.com',
            'role' => TeamRole::Member->value,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('team_invitations', [
        'team_id' => $team->id,
        'email' => 'invited@example.com',
        'role' => TeamRole::Member->value,
    ]);
});

test('team invitations can be created by admins', function () {
    Notification::fake();

    $owner = User::factory()->create();
    $admin = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $owner->switchTeam($team);
    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);
    $admin->switchTeam($team);

    $this
        ->actingAs($admin)
        ->post(route('company.business.invitations.store'), [
            'email' => 'invited@example.com',
            'role' => TeamRole::Member->value,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();
});

test('existing team members cannot be invited', function () {
    Notification::fake();

    $owner = User::factory()->create();
    $member = User::factory()->create(['email' => 'member@example.com']);
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $owner->switchTeam($team);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($team);

    $this
        ->actingAs($owner)
        ->post(route('company.business.invitations.store'), [
            'email' => 'member@example.com',
            'role' => TeamRole::Member->value,
        ])
        ->assertSessionHasErrors('email');
});

test('duplicate invitations cannot be created', function () {
    Notification::fake();

    $owner = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $owner->switchTeam($team);

    TeamInvitation::factory()->create([
        'team_id' => $team->id,
        'email' => 'invited@example.com',
        'invited_by' => $owner->id,
    ]);

    $this
        ->actingAs($owner)
        ->post(route('company.business.invitations.store'), [
            'email' => 'invited@example.com',
            'role' => TeamRole::Member->value,
        ])
        ->assertSessionHasErrors('email');
});

test('team invitations cannot be created by members', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $owner->switchTeam($team);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($team);

    $this
        ->actingAs($member)
        ->post(route('company.business.invitations.store'), [
            'email' => 'invited@example.com',
            'role' => TeamRole::Member->value,
        ])
        ->assertForbidden();
});

test('team invitations can be cancelled by owners', function () {
    $owner = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $owner->switchTeam($team);

    $invitation = TeamInvitation::factory()->create([
        'team_id' => $team->id,
        'invited_by' => $owner->id,
    ]);

    $this
        ->actingAs($owner)
        ->delete(route('company.business.invitations.destroy', ['invitation' => $invitation->code]))
        ->assertRedirect();

    $this->assertDatabaseMissing('team_invitations', [
        'id' => $invitation->id,
    ]);
});
