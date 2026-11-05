<?php

use function Pest\Laravel\get;

/**
 * iOS shows a PWA launch screen only when a startup image's media query
 * matches the device exactly, so every linked image must actually exist.
 */
it('links an existing iOS launch screen for every device size and orientation', function () {
    $html = get('/')->assertOk()->getContent();

    expect($html)->toContain('<meta name="apple-mobile-web-app-capable" content="yes">');

    preg_match_all('/<link rel="apple-touch-startup-image" media="([^"]+)" href="([^"]+)">/', $html, $matches);

    expect($matches[2])->toHaveCount(46)
        ->and(array_unique($matches[1]))->toHaveCount(46)
        ->and(collect($matches[1])->filter(fn (string $media) => str_contains($media, 'orientation: landscape')))->toHaveCount(23);

    foreach ($matches[2] as $href) {
        expect(public_path(ltrim($href, '/')))->toBeFile();
    }
});
