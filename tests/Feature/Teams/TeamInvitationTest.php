<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;

/**
 * Create a team with an owner and a pending invitation for the given email.
 */
function invitationFor(string $email): TeamInvitation
{
    $owner = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    return TeamInvitation::factory()->create([
        'team_id' => $team->id,
        'email' => $email,
        'role' => TeamRole::Member,
        'invited_by' => $owner->id,
    ]);
}

test('a guest without an account is sent to register', function () {
    $invitation = invitationFor('invited@example.com');

    $this
        ->get(route('invitations.accept', $invitation))
        ->assertRedirect(route('register'))
        ->assertSessionHas('team_invitation', $invitation->code);
});

test('a guest with an existing account is sent to login', function () {
    $invitation = invitationFor('invited@example.com');
    User::factory()->create(['email' => 'invited@example.com']);

    $this
        ->get(route('invitations.accept', $invitation))
        ->assertRedirect(route('login'))
        ->assertSessionHas('team_invitation', $invitation->code);
});

test('registering with a pending invitation joins the team without onboarding', function () {
    Notification::fake();

    $invitation = invitationFor('invited@example.com');

    $this
        ->withSession(['team_invitation' => $invitation->code])
        ->post(route('register.store'), [
            'name' => 'Invited User',
            'email' => 'invited@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'terms' => 'on',
        ])
        ->assertRedirect('/dashboard');

    $user = User::where('email', 'invited@example.com')->firstOrFail();

    expect($user->hasVerifiedEmail())->toBeTrue();
    expect($user->belongsToTeam($invitation->team))->toBeTrue();
    expect($user->currentTeam->is($invitation->team))->toBeTrue();
    expect($user->personalTeam())->toBeNull();
    expect($user->teams()->count())->toBe(1);
    expect($invitation->fresh()->accepted_at)->not->toBeNull();

    Notification::assertNotSentTo($user, VerifyEmail::class);
});

test('an authenticated user with a matching email joins the team', function () {
    $invitation = invitationFor('invited@example.com');
    $user = User::factory()->create(['email' => 'invited@example.com']);

    $this
        ->actingAs($user)
        ->get(route('invitations.accept', $invitation))
        ->assertRedirect(route('dashboard'));

    expect($user->fresh()->belongsToTeam($invitation->team))->toBeTrue();
    expect($invitation->fresh()->accepted_at)->not->toBeNull();
});

test('an unverified user is verified when accepting a matching invitation', function () {
    $invitation = invitationFor('invited@example.com');
    $user = User::factory()->unverified()->create(['email' => 'invited@example.com']);

    $this
        ->actingAs($user)
        ->get(route('invitations.accept', $invitation))
        ->assertRedirect(route('dashboard'));

    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    expect($user->fresh()->belongsToTeam($invitation->team))->toBeTrue();
});

test('an authenticated user with a different email cannot accept', function () {
    $invitation = invitationFor('invited@example.com');
    $user = User::factory()->create(['email' => 'someone-else@example.com']);

    $this
        ->actingAs($user)
        ->get(route('invitations.accept', $invitation))
        ->assertRedirect(route('dashboard'));

    expect($user->fresh()->belongsToTeam($invitation->team))->toBeFalse();
    expect($invitation->fresh()->accepted_at)->toBeNull();
});

test('expired invitations cannot be accepted', function () {
    $owner = User::factory()->create();
    $invitedUser = User::factory()->create(['email' => 'invited@example.com']);
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $invitation = TeamInvitation::factory()->expired()->create([
        'team_id' => $team->id,
        'email' => 'invited@example.com',
        'invited_by' => $owner->id,
    ]);

    $this
        ->actingAs($invitedUser)
        ->get(route('invitations.accept', $invitation))
        ->assertRedirect(route('login'));

    expect($invitedUser->fresh()->belongsToTeam($team))->toBeFalse();
});

test('logging in with a pending invitation is routed to acceptance', function () {
    $invitation = invitationFor('invited@example.com');
    User::factory()->create([
        'email' => 'invited@example.com',
        'password' => 'password123',
    ]);

    $this
        ->withSession(['team_invitation' => $invitation->code])
        ->post(route('login.store'), [
            'email' => 'invited@example.com',
            'password' => 'password123',
        ])
        ->assertRedirect(route('invitations.accept', $invitation->code));
});
