<?php

use App\Models\DevicePushToken;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('a device registers its push token against the api token in use', function () {
    $user = User::factory()->create();
    $apiToken = $user->createToken('Phone');

    $this->withToken($apiToken->plainTextToken)
        ->putJson(route('api.v1.me.push-token.store'), [
            'token' => 'ExponentPushToken[abc123]',
            'platform' => 'ios',
        ])->assertNoContent();

    $device = DevicePushToken::sole();

    expect($device->user_id)->toBe($user->id)
        ->and($device->platform)->toBe('ios')
        ->and($device->personal_access_token_id)->toBe($apiToken->accessToken->id);
});

test('registering the same token twice keeps one row', function () {
    Sanctum::actingAs(User::factory()->create());
    $payload = ['token' => 'ExponentPushToken[abc123]', 'platform' => 'android'];

    $this->putJson(route('api.v1.me.push-token.store'), $payload)->assertNoContent();
    $this->putJson(route('api.v1.me.push-token.store'), $payload)->assertNoContent();

    expect(DevicePushToken::count())->toBe(1);
});

test('a token registered by another account on the same phone moves to the caller', function () {
    $previousUser = User::factory()->create();
    DevicePushToken::factory()->for($previousUser)->create(['token' => 'ExponentPushToken[shared]']);
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->putJson(route('api.v1.me.push-token.store'), [
        'token' => 'ExponentPushToken[shared]',
        'platform' => 'ios',
    ])->assertNoContent();

    expect(DevicePushToken::sole()->user_id)->toBe($user->id);
});

test('logging out stops pushes to that device', function () {
    $user = User::factory()->create();
    $apiToken = $user->createToken('Phone');

    $this->withToken($apiToken->plainTextToken)
        ->putJson(route('api.v1.me.push-token.store'), [
            'token' => 'ExponentPushToken[abc123]',
            'platform' => 'ios',
        ])->assertNoContent();

    $this->withToken($apiToken->plainTextToken)
        ->deleteJson(route('api.v1.auth.token.destroy'))
        ->assertNoContent();

    expect(DevicePushToken::count())->toBe(0);
});

test('a malformed push token or platform is rejected', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->putJson(route('api.v1.me.push-token.store'), [
        'token' => 'not-an-expo-token',
        'platform' => 'windows',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['token', 'platform']);

    expect(DevicePushToken::count())->toBe(0);
});

test('a user can remove their own push token but not someone else\'s', function () {
    $user = User::factory()->create();
    $own = DevicePushToken::factory()->for($user)->create();
    $someoneElses = DevicePushToken::factory()->create();
    Sanctum::actingAs($user);

    $this->deleteJson(route('api.v1.me.push-token.destroy'), ['token' => $own->token])->assertNoContent();
    $this->deleteJson(route('api.v1.me.push-token.destroy'), ['token' => $someoneElses->token])->assertNoContent();

    expect(DevicePushToken::pluck('id')->all())->toBe([$someoneElses->id]);
});

test('push token endpoints require a token', function () {
    $this->putJson(route('api.v1.me.push-token.store'), [])->assertUnauthorized();
    $this->deleteJson(route('api.v1.me.push-token.destroy'), [])->assertUnauthorized();
});
