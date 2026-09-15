<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;

uses(RefreshDatabase::class);

/**
 * Create a team with an owner and a pending invitation for the given email.
 */
function googleInvitationFor(string $email): TeamInvitation
{
    $owner = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    return TeamInvitation::factory()->create([
        'team_id' => $team->id,
        'email' => $email,
        'role' => TeamRole::Member,
        'invited_by' => $owner->id,
    ]);
}

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

test('a new google user with a pending invitation joins the team instead of onboarding', function () {
    $invitation = googleInvitationFor('invited@gmail.com');

    fakeGoogleLoginUser(id: 'google-inv', email: 'invited@gmail.com', name: 'Invited Person');

    $this
        ->withSession(['team_invitation' => $invitation->code])
        ->get(route('auth.google.callback'))
        ->assertRedirect('/dashboard')
        ->assertSessionMissing('team_invitation');

    $user = User::where('email', 'invited@gmail.com')->firstOrFail();

    expect($user->google_id)->toBe('google-inv');
    expect($user->belongsToTeam($invitation->team))->toBeTrue();
    expect($user->currentTeam->is($invitation->team))->toBeTrue();
    expect($user->personalTeam())->toBeNull();
    expect($user->teams()->count())->toBe(1);
    expect($invitation->fresh()->accepted_at)->not->toBeNull();
});

test('an existing google user with a pending invitation joins the team', function () {
    $invitation = googleInvitationFor('existing@gmail.com');
    $user = User::factory()->create(['email' => 'existing@gmail.com']);

    fakeGoogleLoginUser(id: 'google-exist', email: 'existing@gmail.com');

    $this
        ->withSession(['team_invitation' => $invitation->code])
        ->get(route('auth.google.callback'))
        ->assertRedirect('/dashboard');

    $this->assertAuthenticatedAs($user);

    $user->refresh();
    expect($user->belongsToTeam($invitation->team))->toBeTrue();
    expect($user->currentTeam->is($invitation->team))->toBeTrue();
    expect($invitation->fresh()->accepted_at)->not->toBeNull();
});

test('an invitation for a different email is ignored and the user signs up normally', function () {
    $invitation = googleInvitationFor('invited@gmail.com');

    fakeGoogleLoginUser(id: 'google-other', email: 'someone-else@gmail.com');

    $this
        ->withSession(['team_invitation' => $invitation->code])
        ->get(route('auth.google.callback'))
        ->assertRedirect('/onboard');

    $user = User::where('email', 'someone-else@gmail.com')->firstOrFail();

    expect($user->belongsToTeam($invitation->team))->toBeFalse();
    expect($user->currentTeam->is_personal)->toBeTrue();
    expect($invitation->fresh()->accepted_at)->toBeNull();
});

test('a declined consent redirects to login without authenticating', function () {
    $this->get(route('auth.google.callback', ['error' => 'access_denied']))
        ->assertRedirect(route('login'));

    $this->assertGuest();
    expect(User::count())->toBe(0);
});
