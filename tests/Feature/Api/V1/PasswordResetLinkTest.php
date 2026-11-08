<?php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

test('a reset link is emailed to an existing account', function () {
    Notification::fake();
    $user = User::factory()->create();

    $this->postJson(route('api.v1.auth.password.email'), ['email' => $user->email])
        ->assertAccepted()
        ->assertJsonPath('message', __('passwords.sent'));

    Notification::assertSentTo($user, ResetPassword::class);
});

test('an unknown email gets the same response so accounts cannot be discovered', function () {
    Notification::fake();

    $this->postJson(route('api.v1.auth.password.email'), ['email' => 'nobody@example.test'])
        ->assertAccepted()
        ->assertJsonPath('message', __('passwords.sent'));

    Notification::assertNothingSent();
});

test('a second request within the broker throttle is rejected', function () {
    Notification::fake();
    $user = User::factory()->create();

    $this->postJson(route('api.v1.auth.password.email'), ['email' => $user->email])->assertAccepted();

    $this->postJson(route('api.v1.auth.password.email'), ['email' => $user->email])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email' => __('passwords.throttled')]);
});

test('an email is required', function () {
    $this->postJson(route('api.v1.auth.password.email'), [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});
