<?php

use App\Models\User;
use Illuminate\Support\Facades\Password;

/**
 * Client-side validation has to survive the DOM being edited.
 *
 * `required` attributes are a hint to the browser, not a guard: anyone can
 * delete them from devtools and then hammer the button, spending a throttled
 * route's whole budget on submissions that were never going to succeed. These
 * tests strip the attributes first, exactly as someone poking at the page
 * would, and then check that nothing leaves the browser anyway.
 *
 * The server-side rules and rate limits are what stop a determined attacker;
 * these cover the ordinary user who would otherwise 429 themselves.
 */
test('the reset password form still blocks an empty submit with required stripped', function () {
    $user = User::factory()->create();
    $token = Password::broker()->createToken($user);

    $page = visit(route('password.reset', ['token' => $token, 'email' => $user->email]));

    // Remove every `required` the way devtools would.
    $page->script(<<<'JS'
        document.querySelectorAll('[required]').forEach((el) => el.removeAttribute('required'));
    JS);

    $page->assertScript('document.querySelectorAll("[required]").length', 0);

    // Press submit repeatedly. Each press must be rejected in the browser, so
    // the route's six-a-minute budget is never touched.
    foreach (range(1, 8) as $attempt) {
        $page->click('@reset-password-button');
    }

    $page->assertSee('This field is required.')
        ->assertNoJavascriptErrors();

    // Still on the reset page, and still able to use the real token: a 429
    // would have burned the attempt and shown the rate-limit toast instead.
    $page->assertDontSee('Too many attempts');

    expect($user->refresh()->password)->toBe($user->password);
});

test('the forgot password form still blocks an empty submit with required stripped', function () {
    $page = visit(route('password.request'));

    $page->script(<<<'JS'
        document.querySelectorAll('[required]').forEach((el) => el.removeAttribute('required'));
    JS);

    foreach (range(1, 8) as $attempt) {
        $page->click('@email-password-reset-link-button');
    }

    $page->assertSee('This field is required.')
        ->assertDontSee('Too many attempts')
        ->assertNoJavascriptErrors();
});

test('a malformed email is rejected in the browser rather than posted', function () {
    $page = visit(route('password.request'));

    // `noValidate` is a DOM property React does not manage, so this survives a
    // re-render — the browser stops checking `type="email"` and the submission
    // reaches our own validation, which is the layer under test.
    $page->script(<<<'JS'
        document.querySelectorAll('[required]').forEach((el) => el.removeAttribute('required'));
        document.getElementById('forgot-password-form').noValidate = true;
    JS);

    $page->fill('email', 'not-an-address')
        ->click('@email-password-reset-link-button')
        ->assertSee('Please enter a valid email address.')
        ->assertDontSee('Too many attempts')
        ->assertNoJavascriptErrors();
});

test('the login form still blocks an empty submit with required stripped', function () {
    $page = visit(route('login'));

    $page->script(<<<'JS'
        document.querySelectorAll('[required]').forEach((el) => el.removeAttribute('required'));
    JS);

    // Press submit repeatedly. Each press must be rejected in the browser, so
    // the login throttle is never touched.
    foreach (range(1, 8) as $attempt) {
        $page->click('@login-button');
    }

    $page->assertSee('This field is required.')
        ->assertDontSee('Too many attempts')
        ->assertNoJavascriptErrors();
});

test('the login form rejects a malformed email in the browser rather than posting', function () {
    $page = visit(route('login'));

    $page->script(<<<'JS'
        document.querySelectorAll('[required]').forEach((el) => el.removeAttribute('required'));
        document.getElementById('login-form').noValidate = true;
    JS);

    $page->fill('email', 'not-an-address')
        ->fill('password', 'whatever-password')
        ->click('@login-button')
        ->assertSee('Please enter a valid email address.')
        ->assertDontSee('Too many attempts')
        ->assertNoJavascriptErrors();
});

test('the register form still blocks an empty submit with required stripped', function () {
    $page = visit(route('register'));

    $page->script(<<<'JS'
        document.querySelectorAll('[required]').forEach((el) => el.removeAttribute('required'));
    JS);

    foreach (range(1, 8) as $attempt) {
        $page->click('@register-user-button');
    }

    $page->assertSee('This field is required.')
        ->assertDontSee('Too many attempts')
        ->assertNoJavascriptErrors();

    // Nothing left the browser, so no account was created.
    expect(User::count())->toBe(0);
});

test('the register form blocks a submit until the terms are accepted', function () {
    $page = visit(route('register'));

    $page->script(<<<'JS'
        document.querySelectorAll('[required]').forEach((el) => el.removeAttribute('required'));
        document.getElementById('register-form').noValidate = true;
    JS);

    $page->fill('name', 'Ada Lovelace')
        ->fill('email', 'ada@example.com')
        ->fill('password', 'super-secret-password')
        ->fill('password_confirmation', 'super-secret-password')
        ->click('@register-user-button')
        ->assertSee('Please accept the Terms & Conditions and Privacy Policy to continue.')
        ->assertDontSee('Too many attempts')
        ->assertNoJavascriptErrors();

    expect(User::count())->toBe(0);
});
