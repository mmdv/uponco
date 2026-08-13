<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Fortify\Features;
use Laravel\Passkeys\Contracts\PasskeyLoginResponse;

test('login screen can be rendered', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard'));
});

test('passkey login response redirects to the current team dashboard', function () {
    $user = User::factory()->create();

    $request = Request::create(route('login', absolute: false), 'GET', server: [
        'HTTP_ACCEPT' => 'application/json',
    ]);
    $request->setLaravelSession($this->app['session.store']);
    $request->setUserResolver(fn () => $user);

    $jsonResponse = app(PasskeyLoginResponse::class)->toResponse($request);

    expect($jsonResponse->getData()->redirect)->toBe(route('dashboard'));
});

test('users with two factor enabled are redirected to two factor challenge', function () {
    if (! Features::canManageTwoFactorAuthentication()) {
        $this->markTestSkipped('Two-factor authentication is not enabled.');
    }

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->withTwoFactor()->create();

    $response = $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('two-factor.login'));
    $response->assertSessionHas('login.id', $user->id);
    $this->assertGuest();
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $this->assertGuest();
    $response->assertRedirect(route('home'));
});

test('users are rate limited', function () {
    $user = User::factory()->create();

    RateLimiter::increment(md5('login'.implode('|', [$user->email, '127.0.0.1'])), amount: 5);

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertTooManyRequests();
});

/**
 * Forget the resolved auth guard so the next request has to work out who the
 * user is from scratch, the way a fresh launch of the app does — otherwise the
 * guard object from the previous request still holds the user in memory.
 */
function forgetResolvedGuard(): void
{
    Auth::clearResolvedInstances();
    app()->forgetInstance('auth');
    app()->forgetInstance('auth.driver');
}

test('remembered users survive the session expiring', function () {
    $user = User::factory()->create();

    $login = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
        'remember' => 'on',
    ]);

    $recallerName = Auth::guard()->getRecallerName();
    $recaller = $login->getCookie($recallerName);

    expect($recaller)->not->toBeNull()
        ->and($recaller->getExpiresTime())->toBeGreaterThan(now()->addYear()->timestamp);

    // Drop everything the session was holding, as an expired session cookie or
    // a swept sessions row would, and come back with only the recaller.
    $this->flushSession();
    forgetResolvedGuard();

    $this->withCookie($recallerName, $recaller->getValue())
        ->get(route('dashboard'))
        ->assertRedirectContains(route('onboarding.show'));

    $this->assertAuthenticatedAs($user);
});

test('the remember cookie is re-issued on every authenticated response', function () {
    $user = User::factory()->create();

    $recallerName = Auth::guard()->getRecallerName();
    $recaller = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
        'remember' => 'on',
    ])->getCookie($recallerName);

    $this->flushSession();
    forgetResolvedGuard();

    $refreshed = $this->withCookie($recallerName, $recaller->getValue())
        ->get(route('dashboard'))
        ->getCookie($recallerName);

    expect($refreshed)->not->toBeNull()
        ->and($refreshed->getValue())->toBe($recaller->getValue())
        ->and($refreshed->isHttpOnly())->toBeTrue()
        ->and($refreshed->getExpiresTime())->toBeGreaterThan(now()->addYear()->timestamp);
});

test('logging out clears the remember cookie instead of refreshing it', function () {
    $user = User::factory()->create();

    $recallerName = Auth::guard()->getRecallerName();
    $recaller = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
        'remember' => 'on',
    ])->getCookie($recallerName);

    $response = $this->withCookie($recallerName, $recaller->getValue())
        ->post(route('logout'));

    // Laravel deletes a cookie by re-sending it with an expiry in the past.
    expect($response->getCookie($recallerName, decrypt: false)->getExpiresTime())
        ->toBeLessThan(now()->timestamp);
    $this->assertGuest();
});
