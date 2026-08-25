<?php

use App\Models\User;

use function Pest\Laravel\actingAs;

/**
 * Changing the login email is an account-takeover primitive: the new address
 * can immediately drive a password reset. It used to need nothing but a live
 * session, so a hijacked cookie converted straight into permanent ownership of
 * the account. It now costs the current password, like every sibling route.
 */
test('changing the login email requires the current password', function () {
    $user = User::factory()->create(['email' => 'owner@example.com']);

    actingAs($user)
        ->patch(route('account.update'), [
            'email' => 'attacker@example.com',
        ])
        ->assertSessionHasErrors('current_password');

    expect($user->refresh()->email)->toBe('owner@example.com');
});

test('a wrong current password does not change the login email', function () {
    $user = User::factory()->create(['email' => 'owner@example.com']);

    actingAs($user)
        ->patch(route('account.update'), [
            'current_password' => 'not-the-password',
            'email' => 'attacker@example.com',
        ])
        ->assertSessionHasErrors('current_password');

    expect($user->refresh()->email)->toBe('owner@example.com');
});

test('the correct current password does change the login email', function () {
    $user = User::factory()->create(['email' => 'owner@example.com']);

    actingAs($user)
        ->patch(route('account.update'), [
            'current_password' => 'password',
            'email' => 'new@example.com',
        ])
        ->assertSessionHasNoErrors();

    expect($user->refresh()->email)->toBe('new@example.com')
        ->and($user->email_verified_at)->toBeNull();
});

test('an unverified user cannot change their login email', function () {
    $user = User::factory()->unverified()->create(['email' => 'owner@example.com']);

    actingAs($user)
        ->patch(route('account.update'), [
            'current_password' => 'password',
            'email' => 'attacker@example.com',
        ])
        ->assertRedirect(route('verification.notice'));

    expect($user->refresh()->email)->toBe('owner@example.com');
});

test('the current password is never written to the user record', function () {
    $user = User::factory()->create(['email' => 'owner@example.com']);
    $hash = $user->password;

    actingAs($user)
        ->patch(route('account.update'), [
            'current_password' => 'password',
            'email' => 'new@example.com',
        ])
        ->assertSessionHasNoErrors();

    expect($user->refresh()->password)->toBe($hash);
});
