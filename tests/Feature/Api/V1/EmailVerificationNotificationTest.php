<?php

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;

test('an unverified user can resend the verification email', function () {
    Notification::fake();
    $user = User::factory()->unverified()->create();
    Sanctum::actingAs($user);

    $this->postJson(route('api.v1.auth.verification.send'))
        ->assertAccepted()
        ->assertJsonPath('status', 'verification-link-sent');

    Notification::assertSentTo($user, VerifyEmail::class);
});

test('a verified user is told they are already verified and gets no email', function () {
    Notification::fake();
    Sanctum::actingAs(User::factory()->create());

    $this->postJson(route('api.v1.auth.verification.send'))
        ->assertOk()
        ->assertJsonPath('status', 'already-verified');

    Notification::assertNothingSent();
});

test('resending verification requires a token', function () {
    $this->postJson(route('api.v1.auth.verification.send'))->assertUnauthorized();
});
