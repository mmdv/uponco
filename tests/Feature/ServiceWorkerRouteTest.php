<?php

use function Pest\Laravel\get;

/**
 * The worker is built to public/build/sw.js but must be reachable at the site
 * root so its scope covers the whole app. These tests fix that contract.
 */
it('serves the built service worker at the site root with root scope', function () {
    $path = public_path('build/sw.js');
    $existed = is_file($path);

    if (! $existed) {
        @mkdir(dirname($path), 0777, true);
        file_put_contents($path, '// service worker under test');
    }

    try {
        $response = get('/sw.js');

        $response->assertOk();
        $response->assertHeader('Service-Worker-Allowed', '/');
        expect($response->headers->get('Cache-Control'))->toContain('no-cache');
        expect($response->headers->get('Content-Type'))->toContain('javascript');
    } finally {
        if (! $existed) {
            @unlink($path);
        }
    }
});

it('returns 404 when the worker has not been built', function () {
    $path = public_path('build/sw.js');
    $backup = "{$path}.bak";
    $existed = is_file($path);

    if ($existed) {
        rename($path, $backup);
    }

    try {
        get('/sw.js')->assertNotFound();
    } finally {
        if ($existed) {
            rename($backup, $path);
        }
    }
});
