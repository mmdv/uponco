<?php

use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Support\Facades\Password;

use function Pest\Laravel\actingAs;

/**
 * Fortify leaves several unauthenticated (or password-accepting) endpoints
 * unthrottled by default. Each one below is a guessing or abuse surface, so the
 * app appends its own limit; these tests make sure the limits are actually
 * attached and not silently dropped when Fortify's route names change.
 */
test('password reset submissions are throttled', function () {
    $user = User::factory()->create();

    foreach (range(1, 6) as $attempt) {
        $this->post(route('password.update'), [
            'token' => 'invalid-token',
            'email' => $user->email,
            'password' => 'Str0ng-Passw0rd!',
            'password_confirmation' => 'Str0ng-Passw0rd!',
        ])->assertStatus(302);
    }

    $this->post(route('password.update'), [
        'token' => Password::broker()->createToken($user),
        'email' => $user->email,
        'password' => 'Str0ng-Passw0rd!',
        'password_confirmation' => 'Str0ng-Passw0rd!',
    ])->assertStatus(429);
});

test('password confirmation attempts are throttled', function () {
    $user = User::factory()->create();

    foreach (range(1, 6) as $attempt) {
        actingAs($user)
            ->post(route('password.confirm.store'), ['password' => 'wrong'])
            ->assertStatus(302);
    }

    // Even the correct password is refused once the limit is spent, so this is
    // no longer an unlimited password oracle for a hijacked session.
    actingAs($user)
        ->post(route('password.confirm.store'), ['password' => 'password'])
        ->assertStatus(429);
});

test('invitation link visits are throttled', function () {
    $owner = User::factory()->create();

    $invitation = TeamInvitation::factory()->create([
        'team_id' => $owner->currentTeam->id,
        'email' => 'invited@example.com',
        'invited_by' => $owner->id,
    ]);

    foreach (range(1, 10) as $attempt) {
        $this->get(route('invitations.accept', $invitation))->assertStatus(302);
    }

    $this->get(route('invitations.accept', $invitation))->assertStatus(429);
});

test('spraying one password across many accounts is throttled by ip', function () {
    // The per-account limiter never sees this: every attempt uses a different
    // username, so only the per-IP ceiling stops it.
    foreach (range(1, 20) as $attempt) {
        $this->post(route('login.store'), [
            'email' => "victim{$attempt}@example.com",
            'password' => 'Summer2026!',
        ])->assertStatus(302);
    }

    $this->post(route('login.store'), [
        'email' => 'victim21@example.com',
        'password' => 'Summer2026!',
    ])->assertStatus(429);
});

test('repeated attempts against one account are still throttled', function () {
    $user = User::factory()->create();

    foreach (range(1, 5) as $attempt) {
        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])->assertStatus(302);
    }

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertStatus(429);
});
