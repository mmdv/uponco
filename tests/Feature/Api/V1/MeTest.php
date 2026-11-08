<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('me requires a token', function () {
    $this->getJson(route('api.v1.me'))->assertUnauthorized();
});

test('me returns the user with their current team and all teams', function () {
    $user = User::factory()->create();
    $personalTeam = $user->currentTeam;
    $otherTeam = Team::factory()->create(['timezone' => 'Asia/Baku']);
    $otherTeam->members()->attach($user, ['role' => TeamRole::Member->value]);
    $user->switchTeam($otherTeam);

    Sanctum::actingAs($user);

    $this->getJson(route('api.v1.me'))
        ->assertOk()
        ->assertJsonPath('data.email', $user->email)
        ->assertJsonPath('data.email_verified', true)
        ->assertJsonPath('data.terms_accepted', true)
        ->assertJsonPath('data.two_factor_enabled', false)
        ->assertJsonPath('data.current_team.id', $otherTeam->id)
        ->assertJsonPath('data.current_team.role', TeamRole::Member->value)
        ->assertJsonPath('data.current_team.timezone', 'Asia/Baku')
        ->assertJsonPath('data.current_team.needs_onboarding', $otherTeam->needsOnboarding())
        ->assertJsonCount(2, 'data.teams')
        ->assertJsonFragment(['id' => $personalTeam->id, 'is_current' => false]);
});

test('me reports the gates the app must show before the dashboard', function () {
    $user = User::factory()->unverified()->withoutTermsAccepted()->create();

    Sanctum::actingAs($user);

    $this->getJson(route('api.v1.me'))
        ->assertOk()
        ->assertJsonPath('data.email_verified', false)
        ->assertJsonPath('data.terms_accepted', false);
});
