<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;

uses(RefreshDatabase::class);

/**
 * Fake the Google Socialite driver so the login callback receives the given
 * identity. `redirectUrl()` is chained by the controller, so it returns self.
 */
function fakeGoogleLoginUser(string $id = 'google-123', string $email = 'new@gmail.com', string $name = 'New Person'): void
{
    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getId')->andReturn($id);
    $socialiteUser->shouldReceive('getEmail')->andReturn($email);
    $socialiteUser->shouldReceive('getName')->andReturn($name);

    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('redirectUrl')->andReturnSelf();
    $provider->shouldReceive('user')->andReturn($socialiteUser);
    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
}

test('the redirect route sends the guest to google', function () {
    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('redirectUrl')->andReturnSelf();
    $provider->shouldReceive('scopes')->andReturnSelf();
    $provider->shouldReceive('redirect')->andReturn(redirect('https://accounts.google.com/o/oauth2/auth'));
    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $this->get(route('auth.google.redirect'))
        ->assertRedirectContains('accounts.google.com');
});

test('a new google user is registered, gets a team and lands on onboarding', function () {
    fakeGoogleLoginUser();

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect('/onboard');
    $this->assertAuthenticated();

    $user = User::where('email', 'new@gmail.com')->first();
    expect($user)->not->toBeNull();
    expect($user->google_id)->toBe('google-123');
    expect($user->name)->toBe('New Person');
    expect($user->email_verified_at)->not->toBeNull();
    expect($user->password)->toBeNull();
    expect($user->currentTeam)->not->toBeNull();
    expect($user->currentTeam->is_personal)->toBeTrue();
});

test('an existing account matched by email is linked and logged in', function () {
    $user = User::factory()->create(['email' => 'existing@gmail.com']);

    fakeGoogleLoginUser(id: 'google-999', email: 'existing@gmail.com', name: 'Ignored');

    // The factory team is fully onboarded, so a returning user goes to dashboard.
    $this->get(route('auth.google.callback'))->assertRedirect('/dashboard');

    $this->assertAuthenticatedAs($user);

    $user->refresh();
    expect($user->google_id)->toBe('google-999');
    // No duplicate account or rename.
    expect(User::where('email', 'existing@gmail.com')->count())->toBe(1);
    expect($user->name)->not->toBe('Ignored');
});

test('an existing account matched by google id is logged in', function () {
    $user = User::factory()->create();
    $user->forceFill(['google_id' => 'google-abc'])->save();

    fakeGoogleLoginUser(id: 'google-abc', email: 'someone-else@gmail.com');

    $this->get(route('auth.google.callback'))->assertRedirect('/dashboard');

    $this->assertAuthenticatedAs($user);
    expect(User::count())->toBe(1);
});

test('a declined consent redirects to login without authenticating', function () {
    $this->get(route('auth.google.callback', ['error' => 'access_denied']))
        ->assertRedirect(route('login'));

    $this->assertGuest();
    expect(User::count())->toBe(0);
});
