<?php

use App\Models\Appointment;
use App\Models\Customer;
use App\Notifications\Appointments\AppointmentBooked;
use App\Support\Appointments\AppointmentOptions;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Notifications\Dispatcher;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

test('the public booking page can be rendered', function () {
    $setup = bookableSetup();

    $this
        ->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertOk();
});

test('the booking page exposes service pricing and specialist availability', function () {
    $setup = bookableSetup();

    $this
        ->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/appointments/book')
            ->where('company.name', $setup['team']->name)
            ->has('services.0', fn (Assert $service) => $service
                ->where('id', $setup['service']->id)
                ->has('price_type')
                ->has('duration')
                ->etc(),
            )
            ->has('specialists.0.next_available', fn (Assert $preview) => $preview
                ->has('date')
                ->has('label')
                ->has('slots'),
            ),
        );
});

test('the booking page exposes the company logo and specialist avatars', function () {
    $setup = bookableSetup();

    $setup['team']->update(['logo_path' => 'team-logos/logo.png']);
    $setup['user']->update(['avatar_path' => 'avatars/me.png']);

    $this
        ->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/appointments/book')
            ->where('company.logo', fn (?string $logo) => str_contains((string) $logo, '/storage/team-logos/logo.png'))
            ->where('specialists.0.avatar', fn (?string $avatar) => str_contains((string) $avatar, '/storage/avatars/me.png'))
        );
});

test('the booking page returns null media when none is set', function () {
    $setup = bookableSetup();

    $this
        ->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/appointments/book')
            ->where('company.logo', null)
            ->where('specialists.0.avatar', null)
        );
});

test('specialist availability excludes fully booked days and reflects only free slots', function () {
    $setup = bookableSetup();

    // Book the specialist's entire working window two days from now so that day
    // has no free slot left at all.
    $blockedDay = CarbonImmutable::now('UTC')->addDays(2)->startOfDay();

    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $blockedDay->setTime(9, 0),
        'end_at' => $blockedDay->setTime(17, 0),
    ]);

    // Book a single early slot tomorrow; that day stays available but the taken
    // time must not appear in the preview.
    $partialDay = CarbonImmutable::now('UTC')->addDay()->startOfDay();

    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $partialDay->setTime(9, 0),
        'end_at' => $partialDay->setTime(10, 0),
    ]);

    $specialist = collect(AppointmentOptions::specialists($setup['team']))
        ->firstWhere('id', $setup['user']->id);

    expect($specialist['available_days'])
        ->not->toContain($blockedDay->format('Y-m-d'))
        ->toContain($partialDay->format('Y-m-d'));

    // The preview seeds from the first bookable day.
    expect($specialist['next_available']['date'])->toBe($specialist['available_days'][0]);
});

test('a guest can book an appointment and a customer is created', function () {
    $setup = bookableSetup();

    $this
        ->post(route('public.appointments.store', ['company' => $setup['team']->slug]), appointmentPayload($setup))
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $this->assertDatabaseHas('customers', [
        'team_id' => $setup['team']->id,
        'email' => 'jane@example.com',
    ]);

    $this->assertDatabaseHas('appointments', [
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'specialist_id' => $setup['user']->id,
        'delivery_type' => 'onsite',
    ]);
});

test('a guest booking emails the confirmation to the customer', function () {
    Notification::fake();
    $setup = bookableSetup();

    $this
        ->post(route('public.appointments.store', ['company' => $setup['team']->slug]), appointmentPayload($setup))
        ->assertRedirect();

    Notification::assertSentOnDemand(
        AppointmentBooked::class,
        fn (AppointmentBooked $notification, array $channels, object $notifiable): bool => $notifiable->routeNotificationFor('mail') === 'jane@example.com',
    );
});

test('a guest booking still succeeds when the confirmation notification cannot be dispatched', function () {
    $setup = bookableSetup();

    $this->mock(Dispatcher::class, function ($mock): void {
        $mock->shouldReceive('send')->andThrow(new RuntimeException('queue unavailable'));
    });

    $this
        ->post(route('public.appointments.store', ['company' => $setup['team']->slug]), appointmentPayload($setup))
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $this->assertDatabaseHas('appointments', [
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
    ]);
});

test('a guest booking reuses an existing customer with the same email', function () {
    $setup = bookableSetup();
    $customer = Customer::factory()->for($setup['team'])->create(['email' => 'jane@example.com']);

    $this
        ->post(route('public.appointments.store', ['company' => $setup['team']->slug]), appointmentPayload($setup))
        ->assertRedirect();

    expect(Customer::count())->toBe(1);
    expect(Appointment::first()->customer_id)->toBe($customer->id);
});

test('a guest booking validates availability', function () {
    $setup = bookableSetup();

    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ]);

    $this
        ->post(route('public.appointments.store', ['company' => $setup['team']->slug]), appointmentPayload($setup))
        ->assertSessionHasErrors('start_at');
});
