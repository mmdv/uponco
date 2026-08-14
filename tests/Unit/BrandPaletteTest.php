<?php

use App\Support\BrandPalette;

test('the accent is the primary at ten percent', function () {
    expect(BrandPalette::accent('#0063ff'))->toBe('rgba(0, 99, 255, 0.1)');
    expect(BrandPalette::accent('#ff6600'))->toBe('rgba(255, 102, 0, 0.1)');
});

test('a palette is derived from a primary colour', function () {
    expect(BrandPalette::fromPrimary('#FF6600'))->toBe([
        'primary' => '#ff6600',
        'accent' => 'rgba(255, 102, 0, 0.1)',
    ]);
});

test('a missing or unusable primary falls back to the platform blue', function (?string $primary) {
    expect(BrandPalette::fromPrimary($primary))->toBe([
        'primary' => BrandPalette::DEFAULT_PRIMARY,
        'accent' => 'rgba(0, 99, 255, 0.1)',
    ]);
})->with([null, '', 'not-a-colour', '#12345']);

test('shorthand hex is expanded', function () {
    expect(BrandPalette::normalise('#f60'))->toBe('#ff6600');
    expect(BrandPalette::normalise('FF6600'))->toBe('#ff6600');
});
