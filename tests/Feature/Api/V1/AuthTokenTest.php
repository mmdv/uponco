<?php

use App\Models\User;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;
use PragmaRX\Google2FA\Google2FA;

/**
 * A user with a real TOTP secret, so a freshly generated code verifies.
 *
 * @return array{0: User, 1: string}
 */
function userWithRealTwoFactor(): array
{
    $secret = app(TwoFactorAuthenticationProvider::class)->generateSecretKey();

    $user = User::factory()->withTwoFactor()->create([
        'two_factor_secret' => encrypt($secret),
    ]);

    return [$user, app(Google2FA::class)->getCurrentOtp($secret)];
}

test('valid credentials issue a token for the device', function () {
    $user = User::factory()->create();

    $response = $this->postJson(route('api.v1.auth.token.store'), [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'Arif iPhone',
    ]);

    $response->assertCreated()
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonPath('user.email', $user->email);

    expect($user->tokens()->sole()->name)->toBe('Arif iPhone');

    $this->withToken($response->json('token'))
        ->getJson(route('api.v1.me'))
        ->assertOk()
        ->assertJsonPath('data.id', $user->id);
});

test('a wrong password is rejected without issuing a token', function () {
    $user = User::factory()->create();

    $this->postJson(route('api.v1.auth.token.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
        'device_name' => 'Arif iPhone',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['email' => __('auth.failed')]);

    expect($user->tokens()->count())->toBe(0);
});

test('an unknown email is rejected with the same message', function () {
    $this->postJson(route('api.v1.auth.token.store'), [
        'email' => 'nobody@example.test',
        'password' => 'password',
        'device_name' => 'Arif iPhone',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['email' => __('auth.failed')]);
});

test('a google-only account without a password cannot get a token by password', function () {
    $user = User::factory()->create(['password' => null]);

    $this->postJson(route('api.v1.auth.token.store'), [
        'email' => $user->email,
        'password' => 'anything',
        'device_name' => 'Arif iPhone',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['email' => __('auth.failed')]);
});

test('email, password and device name are required', function () {
    $this->postJson(route('api.v1.auth.token.store'), [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email', 'password', 'device_name']);
});

test('a two factor account is asked for a code before a token is issued', function () {
    [$user] = userWithRealTwoFactor();

    $this->postJson(route('api.v1.auth.token.store'), [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'Arif iPhone',
    ])->assertOk()
        ->assertExactJson(['two_factor' => true]);

    expect($user->tokens()->count())->toBe(0);
});

test('a valid two factor code issues a token', function () {
    [$user, $code] = userWithRealTwoFactor();

    $this->postJson(route('api.v1.auth.token.store'), [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'Arif iPhone',
        'code' => $code,
    ])->assertCreated()
        ->assertJsonPath('user.two_factor_enabled', true);

    expect($user->tokens()->count())->toBe(1);
});

test('an invalid two factor code is rejected', function () {
    [$user] = userWithRealTwoFactor();

    $this->postJson(route('api.v1.auth.token.store'), [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'Arif iPhone',
        'code' => '000000',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['code' => __('The provided two factor authentication code was invalid.')]);

    expect($user->tokens()->count())->toBe(0);
});

test('a two factor code cannot be used twice', function () {
    [$user, $code] = userWithRealTwoFactor();
    $payload = [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'Arif iPhone',
        'code' => $code,
    ];

    $this->postJson(route('api.v1.auth.token.store'), $payload)->assertCreated();

    $this->postJson(route('api.v1.auth.token.store'), $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['code']);
});

test('a recovery code issues a token and is consumed', function () {
    $user = User::factory()->withTwoFactor()->create();

    $this->postJson(route('api.v1.auth.token.store'), [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'Arif iPhone',
        'recovery_code' => 'recovery-code-1',
    ])->assertCreated();

    expect($user->fresh()->recoveryCodes())->not->toContain('recovery-code-1');
});

test('an invalid recovery code is rejected', function () {
    $user = User::factory()->withTwoFactor()->create();

    $this->postJson(route('api.v1.auth.token.store'), [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'Arif iPhone',
        'recovery_code' => 'not-a-code',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['recovery_code' => __('The provided two factor recovery code was invalid.')]);
});

test('token requests are rate limited per account like the web login', function () {
    $user = User::factory()->create();
    $payload = [
        'email' => $user->email,
        'password' => 'wrong-password',
        'device_name' => 'Arif iPhone',
    ];

    foreach (range(1, 5) as $attempt) {
        $this->postJson(route('api.v1.auth.token.store'), $payload)->assertUnprocessable();
    }

    $this->postJson(route('api.v1.auth.token.store'), $payload)->assertTooManyRequests();
});

test('logout revokes only the token it was called with', function () {
    $user = User::factory()->create();
    $phoneToken = $user->createToken('Phone');
    $tabletToken = $user->createToken('Tablet');

    $this->withToken($phoneToken->plainTextToken)
        ->deleteJson(route('api.v1.auth.token.destroy'))
        ->assertNoContent();

    expect($user->tokens()->pluck('id')->all())->toBe([$tabletToken->accessToken->id]);
});

test('logout requires a token', function () {
    $this->deleteJson(route('api.v1.auth.token.destroy'))->assertUnauthorized();
});
