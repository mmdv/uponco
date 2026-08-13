<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/**
 * A user on a fully set up team, so the dashboard renders rather than
 * redirecting into the onboarding wizard.
 */
function consentUser(string $termsState = ''): User
{
    $user = match ($termsState) {
        'never' => User::factory()->withoutTermsAccepted()->create(),
        'outdated' => User::factory()->withOutdatedTermsAccepted()->create(),
        default => User::factory()->create(),
    };

    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Member->value]);
    $user->switchTeam($team);

    return $user;
}

test('a user who has never accepted the terms is asked to', function () {
    $user = consentUser('never');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('termsConsent.version', config('legal.terms_version'))
            ->where('termsConsent.updated', false)
        );
});

test('a user who accepted an older version is asked again', function () {
    $user = consentUser('outdated');

    expect($user->hasAcceptedCurrentTerms())->toBeFalse();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            // `updated` is what switches the dialog to the "we've changed our
            // terms" wording rather than the first-time wording.
            ->where('termsConsent.updated', true)
        );
});

test('a user who accepted the terms in force is not asked', function () {
    $user = consentUser();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (AssertableInertia $page) => $page->where('termsConsent', null));
});

test('guests are never asked', function () {
    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page) => $page->where('termsConsent', null));
});

test('accepting records the version in force and clears the prompt', function () {
    $user = consentUser('never');

    $this->actingAs($user)
        ->from(route('dashboard'))
        ->post(route('legal.accept'), ['terms' => 'on'])
        ->assertRedirect(route('dashboard'));

    $user->refresh();

    expect($user->terms_version)->toBe(config('legal.terms_version'))
        ->and($user->terms_accepted_at)->not->toBeNull();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (AssertableInertia $page) => $page->where('termsConsent', null));
});

test('accepting without ticking the box is rejected', function () {
    $user = User::factory()->withoutTermsAccepted()->create();

    $this->actingAs($user)
        ->from(route('dashboard'))
        ->post(route('legal.accept'), [])
        ->assertSessionHasErrors('terms');

    expect($user->refresh()->terms_accepted_at)->toBeNull();
});

test('guests cannot accept the terms', function () {
    $this->post(route('legal.accept'), ['terms' => 'on'])
        ->assertRedirect(route('login'));
});

test('accepting works before the team has been onboarded', function () {
    // The dialog blocks the whole app, so a user still in setup has to be able
    // to get past it — this route deliberately sits outside the onboarding and
    // email verification gates.
    $user = User::factory()->unverified()->withoutTermsAccepted()->create();

    $this->actingAs($user)
        ->from(route('onboarding.show'))
        ->post(route('legal.accept'), ['terms' => 'on'])
        ->assertRedirect(route('onboarding.show'));

    expect($user->refresh()->hasAcceptedCurrentTerms())->toBeTrue();
});

test('bumping the terms version asks everyone again', function () {
    $user = consentUser();

    expect($user->hasAcceptedCurrentTerms())->toBeTrue();

    config()->set('legal.terms_version', '2099-01-01');

    expect($user->hasAcceptedCurrentTerms())->toBeFalse();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('termsConsent.version', '2099-01-01')
            ->where('termsConsent.updated', true)
        );
});
