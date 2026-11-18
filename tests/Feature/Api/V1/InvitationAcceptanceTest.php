<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('invitation endpoints require a token', function () {
    $invitation = TeamInvitation::factory()->create();

    $this->getJson(route('api.v1.invitations.show', $invitation))->assertUnauthorized();
    $this->postJson(route('api.v1.invitations.accept', $invitation))->assertUnauthorized();
});

test('the invitee sees what they are invited to', function () {
    $team = Team::factory()->create(['name' => 'Studio Nova']);
    $inviter = User::factory()->create(['name' => 'Ada Owner']);
    $invitee = User::factory()->create(['email' => 'lisa@example.com']);
    $invitation = TeamInvitation::factory()->create([
        'team_id' => $team->id,
        'invited_by' => $inviter->id,
        'email' => 'Lisa@Example.com',
        'role' => TeamRole::Admin,
    ]);
    Sanctum::actingAs($invitee);

    $this->getJson(route('api.v1.invitations.show', $invitation))
        ->assertOk()
        ->assertJsonPath('data.team.name', 'Studio Nova')
        ->assertJsonPath('data.inviter', 'Ada Owner')
        ->assertJsonPath('data.role', 'admin')
        ->assertJsonPath('data.status', 'pending')
        ->assertJsonPath('data.for_you', true)
        ->assertJsonPath('data.already_member', false);
});

test('expired and accepted invitations report their status', function (string $state, string $status) {
    $invitation = TeamInvitation::factory()->{$state}()->create();
    Sanctum::actingAs(User::factory()->create());

    $this->getJson(route('api.v1.invitations.show', $invitation))
        ->assertOk()
        ->assertJsonPath('data.status', $status)
        ->assertJsonPath('data.for_you', false);
})->with([
    'expired' => ['expired', 'expired'],
    'accepted' => ['accepted', 'accepted'],
]);

test('an unknown code is not found', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->getJson(route('api.v1.invitations.show', 'not-a-code'))->assertNotFound();
});

test('accepting joins the team, switches to it and verifies the email', function () {
    $team = Team::factory()->create();
    $invitee = User::factory()->unverified()->create(['email' => 'lisa@example.com']);
    $invitation = TeamInvitation::factory()->create([
        'team_id' => $team->id,
        'email' => 'lisa@example.com',
        'role' => TeamRole::Admin,
    ]);
    Sanctum::actingAs($invitee);

    $this->postJson(route('api.v1.invitations.accept', $invitation))
        ->assertOk()
        ->assertJsonPath('data.team.id', $team->id);

    $invitee->refresh();
    expect($invitee->belongsToTeam($team))->toBeTrue()
        ->and($invitee->teamMembership($team)->role)->toBe(TeamRole::Admin)
        ->and($invitee->current_team_id)->toBe($team->id)
        ->and($invitee->hasVerifiedEmail())->toBeTrue()
        ->and($invitation->fresh()->accepted_at)->not->toBeNull();
});

test('only the invited address can accept', function () {
    $invitation = TeamInvitation::factory()->create(['email' => 'lisa@example.com']);
    $someoneElse = User::factory()->create(['email' => 'sam@example.com']);
    Sanctum::actingAs($someoneElse);

    $this->postJson(route('api.v1.invitations.accept', $invitation))->assertForbidden();

    expect($someoneElse->fresh()->belongsToTeam($invitation->team))->toBeFalse();
});

test('an expired invitation cannot be accepted', function () {
    $invitation = TeamInvitation::factory()->expired()->create(['email' => 'lisa@example.com']);
    Sanctum::actingAs(User::factory()->create(['email' => 'lisa@example.com']));

    $this->postJson(route('api.v1.invitations.accept', $invitation))->assertUnprocessable();
});
