<?php

use App\Models\Appointment;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * The booking page and the widget script are unauthenticated and their slugs
 * are derived from the company name, so they are guessable. Whatever they serve
 * is effectively published, and a team that has not finished onboarding never
 * agreed to publish anything.
 */
test("a freshly registered team's booking page is not served", function () {
    $this->post(route('register.store'), [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'Str0ng-Passw0rd!',
        'password_confirmation' => 'Str0ng-Passw0rd!',
        'terms' => true,
    ])->assertSessionHasNoErrors();

    // Registration creates a team with a slug but no name, timezone or
    // category — the state every account sits in until onboarding finishes.
    $team = User::where('email', 'jane@example.com')->firstOrFail()->currentTeam;

    expect($team->slug)->not->toBeEmpty()
        ->and($team->name)->toBeNull();

    $this->get(route('public.appointments.show', ['company' => $team->slug]))
        ->assertRedirect(route('home'));

    $this->get(route('public.widget.script', ['company' => $team->slug]))
        ->assertNotFound();
});

test('a team without a timezone is not publicly bookable', function () {
    $setup = bookableSetup();
    $setup['team']->update(['timezone' => null]);

    $this->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertRedirect(route('home'));
});

test('a team with no business category stays bookable', function () {
    $setup = bookableSetup();
    $setup['team']->update(['business_category' => null]);

    // The category is presentational. Taking a live booking page offline over a
    // blank cosmetic field would be an outage, not a security control.
    $this->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertOk();
});

test('the widget script is not served for an unbookable team', function () {
    $setup = bookableSetup();
    $slug = $setup['team']->slug;

    $this->get(route('public.widget.script', ['company' => $slug]))->assertOk();

    $setup['team']->forceFill(['is_operator' => true])->save();

    $this->get(route('public.widget.script', ['company' => $slug]))->assertNotFound();
});

test('the public booking page never exposes a member email address', function () {
    $setup = bookableSetup();

    $setup['user']->profile()->create([
        'email' => 'private@example.com',
        'job_title' => 'Stylist',
    ]);

    $response = $this->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->where('specialists', fn ($specialists) => collect($specialists)
            ->every(fn (array $specialist): bool => ! array_key_exists('email', $specialist))
        )
        ->etc()
    );

    // Belt and braces: no email address anywhere in the rendered payload,
    // whichever key it might have arrived under.
    expect($response->getContent())
        ->not->toContain('private@example.com')
        ->not->toContain($setup['user']->email);
});

test('an arbitrary appointment id cannot steer the public slot lookup', function () {
    $setup = bookableSetup();
    $start = $setup['startAt'];
    $day = $start->format('Y-m-d');

    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $start,
        'end_at' => $start->addHour(),
    ]);

    // A visitor guessing ids must not be able to have the busy appointment
    // excluded from the availability calculation.
    $slots = fetchSlotWindow($setup, ['appointment_id' => 999999])
        ->assertOk()
        ->json("props.slotWindow.{$day}");

    expect(collect($slots)->firstWhere('label', '09:00')['available'])->toBeFalse();
});
