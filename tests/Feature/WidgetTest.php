<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;

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

test('the brand page exposes the widget snippet urls to admins', function () {
    $team = Team::factory()->create();
    $admin = User::factory()->create();
    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);
    $admin->switchTeam($team);

    $this
        ->actingAs($admin)
        ->get(route('company.brand.index', ['current_team' => $team->slug]))
        ->assertInertia(fn ($page) => $page
            ->component('company/brand/index')
            ->where('widget.scriptUrl', route('public.widget.script', ['company' => $team->slug]))
            ->where('widget.bookingUrl', route('public.appointments.show', ['company' => $team->slug]))
        );
});
