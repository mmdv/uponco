<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use App\Support\BrandPalette;

test('the widget script is served as javascript for a company', function () {
    $team = Team::factory()->create();

    $response = $this->get(route('public.widget.script', ['company' => $team->slug]));

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toContain('application/javascript');
});

test('the widget script embeds the company booking url', function () {
    $team = Team::factory()->create();

    $bookingUrl = route('public.appointments.show', ['company' => $team->slug]);

    $this
        ->get(route('public.widget.script', ['company' => $team->slug]))
        ->assertSee($bookingUrl, false)
        ->assertSee('__UPONCO_WIDGET__', false);
});

test('the public booking page allows iframe embedding from any origin', function () {
    $team = Team::factory()->create();

    $response = $this->get(route('public.appointments.show', ['company' => $team->slug]));

    $response->assertOk();
    expect($response->headers->get('Content-Security-Policy'))->toContain('frame-ancestors *');
    expect($response->headers->has('X-Frame-Options'))->toBeFalse();
});

test('the brand page exposes the widget snippet urls to admins', function () {
    $team = Team::factory()->create();
    $admin = User::factory()->create();
    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);
    $admin->switchTeam($team);

    $this
        ->actingAs($admin)
        ->get(route('company.brand.index'))
        ->assertInertia(fn ($page) => $page
            ->component('company/brand/index')
            ->where('widget.scriptUrl', route('public.widget.script', ['company' => $team->slug]))
            ->where('widget.bookingUrl', route('public.appointments.show', ['company' => $team->slug]))
        );
});

test('the widget script carries the company brand colours', function () {
    $team = Team::factory()->create(['brand_primary_color' => '#ff6600']);

    $this
        ->get(route('public.widget.script', ['company' => $team->slug]))
        ->assertSee('#ff6600', false)
        ->assertSee('rgba(255, 102, 0, 0.1)', false);
});

test('the widget script falls back to the platform colour', function () {
    $team = Team::factory()->create(['brand_primary_color' => null]);

    $this
        ->get(route('public.widget.script', ['company' => $team->slug]))
        ->assertSee(BrandPalette::DEFAULT_PRIMARY, false);
});
