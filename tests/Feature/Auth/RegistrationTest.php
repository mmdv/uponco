<?php

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('registering sends an email verification notification', function () {
    Notification::fake();

    $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $user = User::where('email', 'test@example.com')->firstOrFail();

    expect($user->hasVerifiedEmail())->toBeFalse();
    Notification::assertSentTo($user, VerifyEmail::class);
});

test('unverified users are redirected to the verification notice', function () {
    $user = User::factory()->unverified()->create();
    $team = $user->personalTeam();

    $this->actingAs($user)
        ->get(route('dashboard', ['current_team' => $team->slug]))
        ->assertRedirect(route('verification.notice'));
});

test('registration is rate limited', function () {
    foreach (range(1, 6) as $attempt) {
        $this->post(route('register.store'), [])
            ->assertStatus(302);
    }

    $this->post(route('register.store'), [])
        ->assertStatus(429);
});

test('new users can register without company details', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();

    $user = User::where('email', 'test@example.com')->first();
    $team = $user->currentTeam;

    $response->assertRedirect(route('onboard.show', ['current_team' => $team->slug]));

    expect($team->is_personal)->toBeTrue();
    expect($team->name)->toBeNull();
    expect($team->business_category)->toBeNull();
    expect($team->timezone)->toBeNull();
    expect($team->slug)->toBe('test-user');
});
