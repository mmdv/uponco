<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('accepting the terms records the current version', function () {
    $user = User::factory()->withoutTermsAccepted()->create();
    Sanctum::actingAs($user);

    $this->postJson(route('api.v1.me.legal-consent.store'), ['terms' => true])
        ->assertOk()
        ->assertJsonPath('data.terms_accepted', true);

    expect($user->fresh()->hasAcceptedCurrentTerms())->toBeTrue();
});

test('the terms must be explicitly accepted', function () {
    $user = User::factory()->withoutTermsAccepted()->create();
    Sanctum::actingAs($user);

    $this->postJson(route('api.v1.me.legal-consent.store'), ['terms' => false])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['terms']);

    expect($user->fresh()->hasAcceptedCurrentTerms())->toBeFalse();
});

test('accepting the terms requires a token', function () {
    $this->postJson(route('api.v1.me.legal-consent.store'), ['terms' => true])->assertUnauthorized();
});
