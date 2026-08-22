<?php

use App\Models\Team;

/**
 * Build an in-memory team with the given locale attributes; no database needed.
 */
function localeTeam(?string $default, mixed $available): Team
{
    $team = new Team;
    $team->default_locale = $default;
    $team->available_locales = $available;

    return $team;
}

test('the default locale falls back to the platform default when unset', function () {
    expect(localeTeam(null, null)->defaultLocale())->toBe('en');
});

test('the default locale falls back when it points at a disabled language', function () {
    expect(localeTeam('fr', ['en'])->defaultLocale())->toBe('en');
});

test('a stored default locale is honoured when still enabled', function () {
    expect(localeTeam('az', ['en', 'az'])->defaultLocale())->toBe('az');
});

test('available locales default to every enabled language when unset', function () {
    expect(localeTeam(null, null)->availableLocales())->toBe(['en', 'az']);
});

test('available locales drop codes that are no longer enabled', function () {
    expect(localeTeam('en', ['en', 'fr'])->availableLocales())->toBe(['en']);
});

test('available locales always include the default language', function () {
    expect(localeTeam('az', ['en'])->availableLocales())->toBe(['en', 'az']);
});
