<?php

use Inertia\Testing\AssertableInertia as Assert;

test('the browser Accept-Language header selects the locale', function () {
    $this->withHeader('Accept-Language', 'az')
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'az'));
});

test('an explicit locale cookie overrides the Accept-Language header', function () {
    $this->withUnencryptedCookie('locale', 'en')
        ->withHeader('Accept-Language', 'az')
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
});

test('an unknown locale falls back to the default', function () {
    $this->withUnencryptedCookie('locale', 'de')
        ->withHeader('Accept-Language', 'fr')
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
});

test('only enabled locales are shared with the UI', function () {
    config(['localization.available.az.enabled' => false]);

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('availableLocales', [
                ['code' => 'en', 'name' => 'English', 'native' => 'English'],
            ]),
        );
});
