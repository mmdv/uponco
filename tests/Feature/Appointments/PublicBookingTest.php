<?php

use App\Concerns\InteractsWithAppointmentBooking;
use App\Enums\AppointmentAlert;
use App\Enums\BusinessCategory;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Service;
use App\Notifications\Appointments\AppointmentActivity;
use App\Notifications\Appointments\AppointmentBooked;
use App\Notifications\Appointments\AppointmentCancelled;
use App\Support\Appointments\AppointmentOptions;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Notifications\Dispatcher;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia as Assert;
use NotificationChannels\WebPush\WebPushChannel;

/**
 * Create a booked appointment for the given setup at its bookable start time.
 */
function bookedAppointment(array $setup, array $overrides = []): Appointment
{
    return Appointment::factory()->create(array_merge([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addMinutes(60),
    ], $overrides));
}

/**
 * A team that onboarded on the online branch: it has a bookable service but
 * never created a location, so `location` is null throughout.
 */
function onlineOnlySetup(): array
{
    $setup = bookableSetup([
        'delivery_type' => 'online',
        'online_meeting_provider' => 'custom',
    ]);

    $setup['service']->locations()->detach();
    $setup['location']->specialists()->detach();
    $setup['location']->forceDelete();

    return [...$setup, 'location' => null];
}

test('the public booking page can be rendered', function () {
    $setup = bookableSetup();

    $this
        ->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertOk();
});

test('a guest cannot manage the public booking page', function () {
    $setup = bookableSetup();

    $this
        ->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/appointments/book')
            ->where('canManage', false)
            ->etc(),
        );
});

test('a member managing the company sees the dashboard shortcut', function () {
    $setup = bookableSetup();

    $this
        ->actingAs($setup['user'])
        ->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/appointments/book')
            ->where('canManage', true)
            ->etc(),
        );
});

test('the public booking page exposes a service without a category', function () {
    $setup = bookableSetup();
    $setup['service']->update(['service_category_id' => null]);

    $this
        ->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/appointments/book')
            ->has('services', 1)
            ->where('services.0.id', $setup['service']->id)
            ->where('services.0.category_id', null)
            ->where('services.0.category_name', null)
            ->etc(),
        );
});

test('the platform team is not publicly bookable and redirects home', function () {
    $setup = bookableSetup();
    $setup['team']->update(['slug' => 'uponco']);

    $this
        ->get(route('public.appointments.show', ['company' => 'uponco']))
        ->assertRedirect(route('home'));
});

test('the booking page exposes the business category behind the service icon', function () {
    $setup = bookableSetup();
    $setup['team']->update(['business_category' => BusinessCategory::VeterinaryClinic]);

    $this
        ->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('company.category', 'veterinary_clinic')
            ->etc(),
        );
});

test('the booking page reports no business category when the team has none', function () {
    $setup = bookableSetup();
    $setup['team']->update(['business_category' => null]);

    $this
        ->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('company.category', null)
            ->etc(),
        );
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

test('the booking page exposes the specialist job title and description', function () {
    $setup = bookableSetup();

    $setup['user']->profile()->updateOrCreate([], [
        'name' => $setup['user']->name,
        'job_title' => 'Senior Barber',
        'description' => 'Ten years of fades and beard work.',
    ]);

    $this
        ->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/appointments/book')
            ->where('specialists.0.job_title', 'Senior Barber')
            ->where('specialists.0.description', 'Ten years of fades and beard work.')
        );
});

test('the booking page returns null profile details when the specialist has no profile', function () {
    $setup = bookableSetup();
    $setup['user']->profile()->delete();

    $this
        ->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/appointments/book')
            ->where('specialists.0.job_title', null)
            ->where('specialists.0.description', null)
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
        // Always lands back on the booking page (never back()/home) so the widget
        // iframe shows the success screen on iOS Safari too.
        ->assertRedirect(route('public.appointments.show', ['company' => $setup['team']->slug]));

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

test('the public booking page renders for an online team with no locations', function () {
    $setup = onlineOnlySetup();

    $this
        ->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('locations', 0)
            ->has('services', 1)
            ->etc(),
        );
});

test('a guest can book an online service on a team with no locations', function () {
    $setup = onlineOnlySetup();

    $this
        ->post(route('public.appointments.store', ['company' => $setup['team']->slug]), appointmentPayload($setup))
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $this->assertDatabaseHas('appointments', [
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => null,
        'delivery_type' => 'online',
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

test('a guest booking pushes an alert to the assigned specialist', function () {
    Notification::fake();
    $setup = bookableSetup();

    $this
        ->post(route('public.appointments.store', ['company' => $setup['team']->slug]), appointmentPayload($setup))
        ->assertRedirect();

    Notification::assertSentTo(
        $setup['user'],
        AppointmentActivity::class,
        // The assigned specialist gets both the bell entry and the phone push.
        fn (AppointmentActivity $notification, array $channels): bool => $notification->alert === AppointmentAlert::Booked
            && $channels === ['database', WebPushChannel::class],
    );
});

test('a customer cancelling from the signed link pushes an alert to the specialist', function () {
    Notification::fake();
    $setup = bookableSetup();
    $appointment = bookedAppointment($setup);

    $this
        ->post(URL::signedRoute('public.appointments.cancel', ['appointment' => $appointment->id]))
        ->assertRedirect();

    Notification::assertSentTo(
        $setup['user'],
        AppointmentActivity::class,
        fn (AppointmentActivity $notification): bool => $notification->alert === AppointmentAlert::Cancelled,
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

test('the booking page exposes the service type and capacity', function () {
    $setup = bookableSetup(['service_type' => 'group', 'capacity' => 5]);

    $this
        ->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('services.0', fn (Assert $service) => $service
                ->where('service_type', 'group')
                ->where('capacity', 5)
                ->etc(),
            ),
        );
});

test('a public booking still requires a name and a contact method', function () {
    $setup = bookableSetup();

    // A note is not enough on the public page: a contact method is still required.
    $this
        ->post(
            route('public.appointments.store', ['company' => $setup['team']->slug]),
            appointmentPayload($setup, ['customer_email' => null, 'customer_phone' => null]),
        )
        ->assertSessionHasErrors('customer_email');

    // And the customer must be named.
    $this
        ->post(
            route('public.appointments.store', ['company' => $setup['team']->slug]),
            appointmentPayload($setup, ['customer_name' => null]),
        )
        ->assertSessionHasErrors('customer_name');

    expect(Appointment::count())->toBe(0);
});

test('multiple guests can book the same group session until it is full', function () {
    $setup = bookableSetup(['service_type' => 'group', 'capacity' => 2]);

    $book = fn (string $email) => $this->post(
        route('public.appointments.store', ['company' => $setup['team']->slug]),
        appointmentPayload($setup, ['customer_email' => $email, 'customer_phone' => null]),
    );

    $book('a@example.com')->assertSessionHasNoErrors()->assertRedirect();
    $book('b@example.com')->assertSessionHasNoErrors()->assertRedirect();

    $sessionBookings = fn () => Appointment::query()
        ->where('service_id', $setup['service']->id)
        ->where('start_at', $setup['startAt'])
        ->count();

    expect($sessionBookings())->toBe(2);

    // The session is now full: a third guest is rejected and no row is created.
    $book('c@example.com')->assertSessionHasErrors('start_at');

    expect($sessionBookings())->toBe(2);
});

test('the same customer cannot book the same group session twice', function () {
    $setup = bookableSetup(['service_type' => 'group', 'capacity' => 4]);

    $book = fn () => $this->post(
        route('public.appointments.store', ['company' => $setup['team']->slug]),
        appointmentPayload($setup, ['customer_email' => 'repeat@example.com', 'customer_phone' => null]),
    );

    $book()->assertSessionHasNoErrors()->assertRedirect();
    $book()->assertSessionHasErrors('booking_conflict');

    expect(Appointment::query()
        ->where('service_id', $setup['service']->id)
        ->where('start_at', $setup['startAt'])
        ->count())->toBe(1);
});

test('public booking submissions are rate limited', function () {
    $setup = bookableSetup();
    $url = route('public.appointments.store', ['company' => $setup['team']->slug]);

    foreach (range(1, 10) as $attempt) {
        $this->post($url)->assertRedirect();
    }

    $this->post($url)->assertTooManyRequests();
});

test('the public booking page is rate limited', function () {
    $route = Route::getRoutes()->getByName('public.appointments.show');

    expect($route->gatherMiddleware())->toContain('throttle:60,1');
});

test('the in-transaction guard rejects an individual slot that was just taken', function () {
    $setup = bookableSetup();
    $endAt = $setup['startAt']->addMinutes(60);

    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt'],
        'end_at' => $endAt,
    ]);

    $booker = new class
    {
        use InteractsWithAppointmentBooking;

        public function guard(Service $service, CarbonInterface $startAt, CarbonInterface $endAt, int $specialistId, int $customerId): void
        {
            $this->guardSlotAvailability($service, $startAt, $endAt, $specialistId, $customerId);
        }
    };

    // A booking that partially overlaps the taken slot is rejected even without
    // going through request validation — this is the race-condition safety net.
    expect(fn () => $booker->guard(
        $setup['service'],
        $setup['startAt']->addMinutes(30),
        $endAt->addMinutes(30),
        $setup['user']->id,
        Customer::factory()->for($setup['team'])->create()->id,
    ))->toThrow(ValidationException::class, 'The selected time slot is no longer available.');

    // A slot that merely touches the taken one (back-to-back) stays bookable.
    $booker->guard(
        $setup['service'],
        $endAt,
        $endAt->addMinutes(60),
        $setup['user']->id,
        Customer::factory()->for($setup['team'])->create()->id,
    );

    expect(true)->toBeTrue();
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

test('a cancelled appointment does not block its slot for a new booking', function () {
    $setup = bookableSetup();

    // A cancelled appointment sits on the slot but must no longer occupy it.
    bookedAppointment($setup)->cancel();

    $this
        ->post(route('public.appointments.store', ['company' => $setup['team']->slug]), appointmentPayload($setup))
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect(Appointment::query()->booked()->count())->toBe(1);
});

test('a cancelled group booking does not consume session capacity', function () {
    $setup = bookableSetup(['service_type' => 'group', 'capacity' => 1]);

    // The single seat is taken by a cancelled booking, so it is free again.
    bookedAppointment($setup)->cancel();

    $this
        ->post(
            route('public.appointments.store', ['company' => $setup['team']->slug]),
            appointmentPayload($setup, ['customer_email' => 'new@example.com', 'customer_phone' => null]),
        )
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect(Appointment::query()->booked()->where('start_at', $setup['startAt'])->count())->toBe(1);
});

test('the cancel page renders the booking details for a valid signed link', function () {
    $setup = bookableSetup();
    $appointment = bookedAppointment($setup);

    $this
        ->get(URL::signedRoute('public.appointments.cancel', ['appointment' => $appointment->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/appointments/cancel')
            ->where('company.name', $setup['team']->name)
            ->where('appointment.id', $appointment->id)
            ->where('appointment.service.title', $setup['service']->title)
            ->where('canCancel', true)
            ->where('alreadyCancelled', false)
            ->where('isPast', false),
        );
});

test('the cancel page rejects an unsigned or tampered link', function () {
    $setup = bookableSetup();
    $appointment = bookedAppointment($setup);

    $this
        ->get(route('public.appointments.cancel', ['appointment' => $appointment->id]))
        ->assertForbidden();
});

test('a customer can cancel their appointment from the signed link', function () {
    Notification::fake();
    $setup = bookableSetup();
    $customer = Customer::factory()->for($setup['team'])->create(['email' => 'jane@example.com']);
    $appointment = bookedAppointment($setup, ['customer_id' => $customer->id]);

    $this
        ->post(URL::signedRoute('public.appointments.cancel', ['appointment' => $appointment->id]))
        ->assertRedirect();

    // The row is kept for reporting; only its status changes.
    $this->assertDatabaseHas('appointments', [
        'id' => $appointment->id,
        'status' => 'cancelled',
        'deleted_at' => null,
    ]);

    expect($appointment->fresh()->cancelled_at)->not->toBeNull();

    Notification::assertSentOnDemand(
        AppointmentCancelled::class,
        fn (AppointmentCancelled $notification, array $channels, object $notifiable): bool => $notifiable->routeNotificationFor('mail') === 'jane@example.com',
    );
});

test('a past appointment cannot be cancelled from the link', function () {
    $setup = bookableSetup();
    $appointment = bookedAppointment($setup, [
        'start_at' => CarbonImmutable::now('UTC')->subDay(),
        'end_at' => CarbonImmutable::now('UTC')->subDay()->addMinutes(60),
    ]);

    $this
        ->post(URL::signedRoute('public.appointments.cancel', ['appointment' => $appointment->id]))
        ->assertRedirect();

    expect($appointment->fresh()->isCancelled())->toBeFalse();
});

test('an already cancelled appointment is not cancelled again', function () {
    Notification::fake();
    $setup = bookableSetup();
    $appointment = bookedAppointment($setup);
    $appointment->cancel();
    $cancelledAt = $appointment->fresh()->cancelled_at;

    $this
        ->post(URL::signedRoute('public.appointments.cancel', ['appointment' => $appointment->id]))
        ->assertRedirect();

    // The cancellation timestamp is untouched and no second email is sent.
    expect($appointment->fresh()->cancelled_at->equalTo($cancelledAt))->toBeTrue();
    Notification::assertNothingSent();
});

test('cancelled appointments are excluded from the team listing', function () {
    $setup = bookableSetup();
    bookedAppointment($setup);
    bookedAppointment($setup, ['start_at' => $setup['startAt']->addDay(), 'end_at' => $setup['startAt']->addDay()->addMinutes(60)])->cancel();

    $this
        ->actingAs($setup['user'])
        ->get(route('appointments.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('appointments', 1));
});
