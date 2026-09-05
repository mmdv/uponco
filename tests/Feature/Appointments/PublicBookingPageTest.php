<?php

use App\Enums\TeamRole;
use App\Enums\TeamType;
use App\Models\Appointment;
use App\Models\Location;
use App\Models\Service;
use App\Models\User;
use App\Support\Appointments\AppointmentOptions;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * Visit the booking page for the setup's team.
 */
function visitBooking(array $setup, array $query = []): TestResponse
{
    return test()->get(route('public.appointments.show', ['company' => $setup['team']->slug]).'?'.http_build_query($query));
}

/**
 * Add a second location to the setup's team, wired to the same service and
 * specialist, so the location genuinely becomes a choice.
 */
function secondLocation(array $setup): Location
{
    $location = Location::factory()->for($setup['team'])->create(['name' => 'Northside Clinic']);

    $setup['service']->locations()->attach($location);
    $location->specialists()->attach($setup['user']);

    return $location;
}

/**
 * Add a second service to the setup's team, offered by the same specialist at
 * the same location.
 *
 * @param  array<string, mixed>  $overrides
 */
function secondService(array $setup, array $overrides = []): Service
{
    $service = Service::factory()->for($setup['team'])->create(array_merge([
        'service_category_id' => null,
        'title' => 'Beard trim',
        'duration' => 30,
        'technical_break' => 0,
        'service_type' => 'individual',
        'capacity' => null,
        'delivery_type' => 'onsite',
        'online_meeting_provider' => null,
        'is_active' => true,
    ], $overrides));

    $service->specialists()->attach($setup['user']);

    if (($overrides['delivery_type'] ?? 'onsite') !== 'online') {
        $service->locations()->attach($setup['location']);
    }

    return $service;
}

test('the page ships the address, phone and directions link for each location', function () {
    $setup = bookableSetup();
    $setup['location']->update([
        'phone' => '+994 12 555 00 11',
        'street_address' => '15 Nizami Street',
        'city' => 'Baku',
    ]);

    visitBooking($setup)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/appointments/book')
            ->has('locations', 1)
            ->where('locations.0.phone', '+994 12 555 00 11')
            ->where('locations.0.city', 'Baku')
            ->where('locations.0.slug', $setup['location']->fresh()->slug)
            ->where('locations.0.is_geocoded', false)
            ->etc(),
        );

    expect(AppointmentOptions::detailedLocations($setup['team'])[0])
        ->address->toContain('15 Nizami Street')
        ->directions_url->toContain('google.com/maps');
});

test('an individual business leads with the owner name and job title', function () {
    $setup = bookableSetup();
    $setup['team']->update(['type' => TeamType::Individual]);
    $setup['user']->profile()->updateOrCreate([], ['job_title' => 'Master barber']);

    visitBooking($setup)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('company.type', 'individual')
            ->where('company.headline', $setup['user']->name)
            ->where('company.tagline', 'Master barber')
            ->etc(),
        );
});

test('an organisation keeps the company name and no tagline', function () {
    $setup = bookableSetup();
    $setup['team']->update(['type' => TeamType::Organisation]);
    $setup['user']->profile()->updateOrCreate([], ['job_title' => 'Master barber']);

    visitBooking($setup)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('company.headline', $setup['team']->name)
            ->where('company.tagline', null)
            ->etc(),
        );
});

test('the ordinary booking page carries no preset', function () {
    $setup = bookableSetup();

    visitBooking($setup)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('preset', null)->etc());
});

test('the service deep link preselects that service', function () {
    $setup = bookableSetup();
    $service = $setup['service']->fresh();

    $this->get(route('public.appointments.service', [
        'company' => $setup['team']->slug,
        'service' => $service->slug,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/appointments/book')
            ->where('preset.type', 'service')
            ->where('preset.id', $service->id)
            ->where('preset.name', $service->title)
            ->where('preset.back_url', route('public.appointments.show', $setup['team']))
            ->etc(),
        );
});

test('the location deep link preselects that location', function () {
    $setup = bookableSetup();
    $location = $setup['location']->fresh();

    $this->get(route('public.appointments.location', [
        'company' => $setup['team']->slug,
        'location' => $location->slug,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('preset.type', 'location')
            ->where('preset.id', $location->id)
            ->etc(),
        );
});

test('the specialist deep link preselects that specialist by their name slug', function () {
    $setup = bookableSetup();
    $slug = AppointmentOptions::specialistSlugs($setup['team'])[$setup['user']->id];

    expect($slug)->toBe(Str::slug($setup['user']->name));

    $this->get(route('public.appointments.specialist', [
        'company' => $setup['team']->slug,
        'specialist' => $slug,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('preset.type', 'specialist')
            ->where('preset.id', $setup['user']->id)
            ->where('preset.name', $setup['user']->name)
            ->etc(),
        );
});

test('two specialists whose names slugify alike get distinct slugs', function () {
    $setup = bookableSetup();
    $setup['user']->update(['name' => 'Ana Mammadova']);

    $twin = User::factory()->create(['name' => 'ana mammadova']);
    $setup['team']->members()->attach($twin, ['role' => TeamRole::Member->value]);

    $slugs = AppointmentOptions::specialistSlugs($setup['team']->fresh());

    expect($slugs[$setup['user']->id])->toBe('ana-mammadova-'.$setup['user']->id)
        ->and($slugs[$twin->id])->toBe('ana-mammadova-'.$twin->id);

    $this->get(route('public.appointments.specialist', [
        'company' => $setup['team']->slug,
        'specialist' => $slugs[$twin->id],
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('preset.id', $twin->id)->etc());
});

test('a deep link for another company 404s', function () {
    $setup = bookableSetup();
    $other = bookableSetup();

    $this->get(route('public.appointments.service', [
        'company' => $setup['team']->slug,
        'service' => $other['service']->fresh()->slug,
    ]))
        ->assertNotFound();

    $this->get(route('public.appointments.location', [
        'company' => $setup['team']->slug,
        'location' => 'nowhere-at-all',
    ]))
        ->assertNotFound();
});

test('the slot window partial reload resolves the optional prop', function () {
    $setup = bookableSetup();
    $day = $setup['startAt']->format('Y-m-d');

    fetchSlotWindow($setup)
        ->assertOk()
        ->assertJsonPath('component', 'public/appointments/book')
        ->assertJsonPath("props.slotWindow.{$day}.0.label", '09:00');
});

test('the slot window returns a keyed map for seven consecutive days', function () {
    $setup = bookableSetup();
    $start = $setup['startAt'];

    $response = fetchSlotWindow($setup)->assertOk();

    // Seven consecutive Y-m-d keys, each carrying that day's slots.
    foreach (range(0, 6) as $offset) {
        $day = $start->addDays($offset)->format('Y-m-d');

        $response->assertJsonPath("props.slotWindow.{$day}.0.label", '09:00');
    }

    expect(array_keys($response->json('props.slotWindow')))
        ->toHaveCount(7)
        ->toBe(collect(range(0, 6))->map(fn (int $offset): string => $start->addDays($offset)->format('Y-m-d'))->all());
});

test('a day in the window with no schedule is present as an empty list', function () {
    // The setup seeds a schedule for offsets 0–6 only, so day 7 has none.
    $setup = bookableSetup();
    $emptyDay = $setup['startAt']->addDays(7)->format('Y-m-d');

    fetchSlotWindow($setup, [
        'date' => $setup['startAt']->addDay()->format('Y-m-d'),
        'days' => 7,
    ])
        ->assertOk()
        ->assertJsonPath("props.slotWindow.{$emptyDay}", []);
});

test('a booking posts to the store action and persists', function () {
    $setup = bookableSetup();

    $this
        ->post(route('public.appointments.store', ['company' => $setup['team']->slug]), appointmentPayload($setup))
        ->assertRedirect(route('public.appointments.show', $setup['team']));

    expect(Appointment::query()->count())->toBe(1);

    $appointment = Appointment::query()->sole();

    expect($appointment->service_id)->toBe($setup['service']->id)
        ->and($appointment->location_id)->toBe($setup['location']->id)
        ->and($appointment->specialist_id)->toBe($setup['user']->id);
});

test('services and locations get a slug that is unique within the team', function () {
    $setup = bookableSetup();
    $setup['service']->update(['title' => 'Deep Tissue Massage']);

    expect($setup['service']->fresh()->slug)->toBe('deep-tissue-massage');

    $twin = secondService($setup, ['title' => 'Deep Tissue Massage']);

    expect($twin->slug)->toBe('deep-tissue-massage-1');

    // A different team is free to reuse the name.
    $other = bookableSetup();
    $other['service']->update(['title' => 'Deep Tissue Massage']);

    expect($other['service']->fresh()->slug)->toBe('deep-tissue-massage');
});

test('the option payload reflects what is genuinely choosable', function () {
    // One of everything: nothing here is a real choice for the visitor.
    $setup = bookableSetup();

    visitBooking($setup)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('services', 1)
            ->has('specialists', 1)
            ->has('locations', 1)
            ->etc(),
        );

    // Widening the team widens the payload, which is what unlocks the pickers.
    secondService($setup);
    secondLocation($setup);
    teamMemberSpecialist($setup);

    visitBooking($setup)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('services', 2)
            ->has('specialists', 2)
            ->has('locations', 2)
            ->etc(),
        );
});

test('the booking page renders in the team default language and offers its languages', function () {
    $setup = bookableSetup();
    $setup['team']->update(['default_locale' => 'az', 'available_locales' => ['az', 'en']]);

    visitBooking($setup)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/appointments/book')
            ->where('locale', 'az')
            ->where('availableLocales', fn ($locales) => collect($locales)->pluck('code')->all() === ['en', 'az'])
            ->etc(),
        );
});

test('a visitor cookie only wins when the team still offers that language', function () {
    $setup = bookableSetup();
    $setup['team']->update(['default_locale' => 'en', 'available_locales' => ['en']]);

    // The team dropped Azerbaijani, so a stale az cookie falls back to the default.
    test()->withCookie('locale', 'az');

    visitBooking($setup)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('locale', 'en')
            ->where('availableLocales', fn ($locales) => collect($locales)->pluck('code')->all() === ['en'])
            ->etc(),
        );
});
