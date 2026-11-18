<?php

use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * A throwaway RSA key standing in for Apple's signing key; Apple's key
 * endpoint is faked to publish its public half.
 *
 * @return array{private: string, jwk: array<string, string>}
 */
function appleTestKey(): array
{
    static $key = null;

    if ($key === null) {
        $resource = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        openssl_pkey_export($resource, $private);
        $details = openssl_pkey_get_details($resource);
        $base64Url = fn (string $bytes): string => rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');

        $key = [
            'private' => $private,
            'jwk' => [
                'kty' => 'RSA',
                'kid' => 'test-key',
                'use' => 'sig',
                'alg' => 'RS256',
                'n' => $base64Url($details['rsa']['n']),
                'e' => $base64Url($details['rsa']['e']),
            ],
        ];
    }

    return $key;
}

/**
 * @param  array<string, mixed>  $claims
 */
function appleIdentityToken(array $claims = []): string
{
    return JWT::encode([
        'iss' => 'https://appleid.apple.com',
        'aud' => 'com.uponco.app',
        'sub' => 'apple-001',
        'email' => 'owner@example.test',
        'email_verified' => 'true',
        'iat' => time(),
        'exp' => time() + 600,
        ...$claims,
    ], appleTestKey()['private'], 'RS256', 'test-key');
}

beforeEach(function () {
    Cache::flush();
    config(['services.apple.client_ids' => ['com.uponco.app']]);
    Http::fake(['appleid.apple.com/auth/keys' => Http::response(['keys' => [appleTestKey()['jwk']]])]);
});

test('an existing account signs in with apple and gets its apple id linked', function () {
    $user = User::factory()->create(['email' => 'owner@example.test']);

    $this->postJson(route('api.v1.auth.apple.store'), [
        'identity_token' => appleIdentityToken(),
        'device_name' => 'Arif iPhone',
    ])->assertCreated()
        ->assertJsonPath('user.email', 'owner@example.test')
        ->assertJsonStructure(['token']);

    expect($user->fresh()->apple_id)->toBe('apple-001');
});

test('a linked apple id signs in even with a hidden relay email', function () {
    User::factory()->create(['email' => 'owner@example.test', 'apple_id' => 'apple-001']);

    $this->postJson(route('api.v1.auth.apple.store'), [
        'identity_token' => appleIdentityToken(['email' => 'abc@privaterelay.appleid.com', 'is_private_email' => 'true']),
        'device_name' => 'Arif iPhone',
    ])->assertCreated()->assertJsonPath('user.email', 'owner@example.test');
});

test('an unknown apple user gets no account and is told why', function (array $claims, string $message) {
    $this->postJson(route('api.v1.auth.apple.store'), [
        'identity_token' => appleIdentityToken($claims),
        'device_name' => 'Arif iPhone',
    ])->assertUnprocessable()->assertJsonPath('errors.identity_token.0', fn (string $text) => str_contains($text, $message));

    expect(User::count())->toBe(0);
})->with([
    'unknown email' => [['email' => 'new@example.test'], 'Sign up on the web first'],
    'hidden email' => [['email' => 'abc@privaterelay.appleid.com', 'is_private_email' => 'true'], 'Share My Email'],
]);

test('tokens for another app, from another issuer or badly signed are rejected', function (string $token) {
    User::factory()->create(['email' => 'owner@example.test']);

    $this->postJson(route('api.v1.auth.apple.store'), [
        'identity_token' => $token,
        'device_name' => 'Arif iPhone',
    ])->assertUnprocessable()->assertJsonValidationErrors('identity_token');
})->with([
    'other app' => fn () => appleIdentityToken(['aud' => 'com.other.app']),
    'other issuer' => fn () => appleIdentityToken(['iss' => 'https://evil.example']),
    'expired' => fn () => appleIdentityToken(['exp' => time() - 60]),
    'garbage' => fn () => 'not-a-jwt',
]);

test('an unverified email does not match an account', function () {
    User::factory()->create(['email' => 'owner@example.test']);

    $this->postJson(route('api.v1.auth.apple.store'), [
        'identity_token' => appleIdentityToken(['email_verified' => 'false']),
        'device_name' => 'Arif iPhone',
    ])->assertUnprocessable();
});
