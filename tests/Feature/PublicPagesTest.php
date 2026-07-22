<?php

use Inertia\Testing\AssertableInertia;

/**
 * The marketing pages have to stay reachable — and crawlable — without an
 * account, because Google's OAuth review checks them while logged out.
 */
it('serves every public marketing page to guests', function (string $route, string $component) {
    $this->get(route($route))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->component($component));
})->with([
    'home' => ['home', 'welcome'],
    'pricing' => ['pricing', 'pricing'],
    'privacy' => ['privacy', 'legal/privacy'],
    'terms' => ['terms', 'legal/terms'],
]);

it('renders the page-specific title and description for crawlers', function (string $route, string $title) {
    $this->get(route($route))
        ->assertOk()
        ->assertSee($title, false)
        ->assertSee('<meta name="robots" content="index, follow, max-image-preview:large">', false);
})->with([
    'home' => ['home', 'Uponco — Appointment Booking Software for Your Business'],
    'pricing' => ['pricing', 'Pricing — Uponco'],
    'privacy' => ['privacy', 'Privacy Policy — Uponco'],
    'terms' => ['terms', 'Terms &amp; Conditions — Uponco'],
]);

it('lists every public page in the sitemap', function () {
    $response = $this->get(route('sitemap'))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/xml');

    foreach (['home', 'pricing', 'privacy', 'terms'] as $name) {
        $response->assertSee('<loc>'.route($name).'</loc>', false);
    }
});

it('points robots.txt at the sitemap and allows crawling', function () {
    $this->get(route('robots'))
        ->assertOk()
        ->assertSee('Allow: /')
        ->assertSee('Sitemap: '.route('sitemap'));
});
