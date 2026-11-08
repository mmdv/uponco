<?php

use App\Models\User;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config([
        'services.google.client_id' => 'web-client.apps.googleusercontent.com',
        'services.google.mobile_client_ids' => ['ios-client.apps.googleusercontent.com'],
    ]);
});

/**
 * Fake Google's tokeninfo answer for the ID token the app sends.
 *
 * @param  array<string, mixed>  $claims
 */
function fakeGoogleTokenInfo(array $claims = [], int $status = 200): void
{
    Http::fake([
        'oauth2.googleapis.com/tokeninfo*' => Http::response([
            'iss' => 'https://accounts.google.com',
            'aud' => 'ios-client.apps.googleusercontent.com',
            'sub' => 'google-123',
            'email' => 'owner@example.test',
            'email_verified' => 'true',
            'name' => 'Owner',
            ...$claims,
        ], $status),
    ]);
}

test('an existing account signs in with google and gets its google id linked', function () {
    $user = User::factory()->create(['email' => 'owner@example.test', 'google_id' => null]);
    fakeGoogleTokenInfo();

    $this->postJson(route('api.v1.auth.google.store'), [
        'id_token' => 'id-token',
        'device_name' => 'Arif iPhone',
    ])->assertCreated()
        ->assertJsonPath('user.id', $user->id);

    expect($user->fresh()->google_id)->toBe('google-123')
        ->and($user->tokens()->sole()->name)->toBe('Arif iPhone');
});

test('an account is found by its google id even if the email changed', function () {
    $user = User::factory()->create(['email' => 'old@example.test', 'google_id' => 'google-123']);
    fakeGoogleTokenInfo();

    $this->postJson(route('api.v1.auth.google.store'), [
        'id_token' => 'id-token',
        'device_name' => 'Arif iPhone',
    ])->assertCreated()
        ->assertJsonPath('user.id', $user->id);
});

test('a google address without an account is not signed up', function () {
    fakeGoogleTokenInfo();

    $this->postJson(route('api.v1.auth.google.store'), [
        'id_token' => 'id-token',
        'device_name' => 'Arif iPhone',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['id_token' => __('No Uponco account uses this Google address. Sign up on the web first.')]);

    expect(User::where('email', 'owner@example.test')->exists())->toBeFalse();
});

test('a token google rejects is refused', function () {
    User::factory()->create(['email' => 'owner@example.test']);
    fakeGoogleTokenInfo(status: 400);

    $this->postJson(route('api.v1.auth.google.store'), [
        'id_token' => 'bad-token',
        'device_name' => 'Arif iPhone',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['id_token' => __('Could not sign you in with Google. Please try again.')]);
});

test('a token issued for another app is refused', function () {
    User::factory()->create(['email' => 'owner@example.test']);
    fakeGoogleTokenInfo(['aud' => 'someone-elses-app.apps.googleusercontent.com']);

    $this->postJson(route('api.v1.auth.google.store'), [
        'id_token' => 'id-token',
        'device_name' => 'Arif iPhone',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['id_token']);
});

test('a token whose email google has not verified is refused', function () {
    User::factory()->create(['email' => 'owner@example.test']);
    fakeGoogleTokenInfo(['email_verified' => 'false']);

    $this->postJson(route('api.v1.auth.google.store'), [
        'id_token' => 'id-token',
        'device_name' => 'Arif iPhone',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['id_token']);
});

test('a token for the web client id is accepted', function () {
    $user = User::factory()->create(['email' => 'owner@example.test']);
    fakeGoogleTokenInfo(['aud' => 'web-client.apps.googleusercontent.com']);

    $this->postJson(route('api.v1.auth.google.store'), [
        'id_token' => 'id-token',
        'device_name' => 'Arif iPhone',
    ])->assertCreated()
        ->assertJsonPath('user.id', $user->id);
});

test('id token and device name are required', function () {
    $this->postJson(route('api.v1.auth.google.store'), [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['id_token', 'device_name']);
});
