<?php

use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Location;
use App\Models\ScheduleSlot;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Team;
use App\Models\User;
use Carbon\CarbonImmutable;

/**
 * Seed a bookable team whose only specialist works a full day *tomorrow*, so
 * the browser flow can click the stable "Tmrw" day chip and land on real slots.
 *
 * One service, one specialist, one on-site location — so the page has nothing
 * to ask and the first step arrives fully decided.
 *
 * @return array{user: User, team: Team, service: Service, location: Location, day: CarbonImmutable}
 */
function bookableTomorrowSetup(): array
{
    $user = User::factory()->create(['name' => 'Alex Specialist']);
    $team = $user->currentTeam;
    $team->update(['timezone' => 'UTC']);

    $category = ServiceCategory::factory()->for($team)->create();
    $service = Service::factory()->for($category, 'category')->create([
        'title' => 'Deep Tissue Massage',
        'duration' => 60,
        'technical_break' => 0,
        'service_type' => 'individual',
        'capacity' => null,
        'delivery_type' => 'onsite',
        'online_meeting_provider' => null,
        'is_active' => true,
    ]);

    $location = Location::factory()->for($team)->create(['name' => 'Downtown Studio']);
    $service->locations()->attach($location);
    $service->specialists()->attach($user);
    $location->specialists()->attach($user);

    $day = CarbonImmutable::now('UTC')->addDay();

    ScheduleSlot::factory()->for($user)->create([
        'team_id' => $team->id,
        'date' => $day->format('Y-m-d'),
        'start_time' => '09:00',
        'end_time' => '17:00',
    ]);

    return compact('user', 'team', 'service', 'location', 'day');
}

/**
 * Drive the wizard from a fresh page up to (but not through) the details step.
 *
 * With one of everything there is nothing to pick on the first step, so the
 * flow goes straight from the recap to tomorrow's 09:00 slot.
 *
 * Days, slots and the primary button are targeted by data-test: times ("09:00")
 * and the "Choose date & time" label read as CSS selectors when matched by
 * visible text.
 *
 * @param  array{team: Team, day: CarbonImmutable}  $setup
 */
function advanceToDetails(array $setup): object
{
    $page = visit(route('public.appointments.show', ['company' => $setup['team']->slug]));

    $page->assertSee("Here's your booking")
        ->assertSee('Deep Tissue Massage')
        ->assertSee('Alex Specialist')
        ->assertSee('Downtown Studio')
        ->click('@appointment-continue-button');

    $page->click('@booking-day-'.$setup['day']->format('Y-m-d'))
        ->assertSee('09:00')
        ->click('@booking-slot-0900')
        ->click('@appointment-continue-button')
        ->assertSee('Your details');

    return $page;
}

test('a guest can book an appointment through the whole flow', function () {
    $setup = bookableTomorrowSetup();

    $page = advanceToDetails($setup);

    $page->fill('customer_name', 'Jane Doe')
        ->fill('customer_email', 'jane@example.com')
        ->fill('customer_phone', '+15551234567')
        ->click('Confirm booking');

    // Success screen and a persisted appointment for a freshly created customer.
    $page->assertSee("You're booked in")
        ->assertSee('Deep Tissue Massage');

    $customer = Customer::where('email', 'jane@example.com')->first();
    expect($customer)->not->toBeNull();
    expect($customer->name)->toBe('Jane Doe');
    expect(Appointment::query()->count())->toBe(1);
    expect(Appointment::first()->customer_id)->toBe($customer->id);
});

test('the flow blocks a submission with no customer details', function () {
    $setup = bookableTomorrowSetup();

    $page = advanceToDetails($setup);

    // Confirm with every field blank: the server rejects it, so the wizard
    // stays on the details step and nothing is persisted.
    $page->click('Confirm booking')
        ->assertSee('Your details')
        ->assertDontSee("You're booked in");

    expect(Appointment::query()->count())->toBe(0);
    expect(Customer::query()->count())->toBe(0);
});

test('a guest picks from the cards when the team offers a real choice', function () {
    $setup = bookableTomorrowSetup();

    // A second service and specialist turn both back into pickers; the single
    // location stays settled and leads the step.
    $second = Service::factory()->for($setup['team'])->create([
        'service_category_id' => null,
        'title' => 'Sports Massage',
        'duration' => 60,
        'technical_break' => 0,
        'service_type' => 'individual',
        'capacity' => null,
        'delivery_type' => 'onsite',
        'online_meeting_provider' => null,
        'is_active' => true,
    ]);
    $second->locations()->attach($setup['location']);

    $colleague = User::factory()->create(['name' => 'Robin Colleague']);
    $setup['team']->members()->attach($colleague, ['role' => 'member']);
    $setup['service']->specialists()->attach($colleague);
    $second->specialists()->attach($setup['user']);
    $second->specialists()->attach($colleague);
    $setup['location']->specialists()->attach($colleague);

    ScheduleSlot::factory()->for($colleague)->create([
        'team_id' => $setup['team']->id,
        'date' => $setup['day']->format('Y-m-d'),
        'start_time' => '09:00',
        'end_time' => '17:00',
    ]);

    $page = visit(route('public.appointments.show', ['company' => $setup['team']->slug]));

    // The lone location leads as a settled row; service and specialist are
    // still pickers and have to be opened and chosen from. (A collapsed card
    // keeps its options in the DOM — it closes with a grid-rows transition —
    // so there is nothing meaningful to assert about them being hidden.)
    $page->assertSee('Downtown Studio')
        ->assertSee('Location')
        ->click('Service')
        ->click('Sports Massage')
        ->click('Robin Colleague')
        ->click('@appointment-continue-button');

    $page->click('@booking-day-'.$setup['day']->format('Y-m-d'))
        ->click('@booking-slot-0900')
        ->click('@appointment-continue-button')
        ->assertSee('Your details');

    $page->fill('customer_name', 'Sam Guest')
        ->fill('customer_email', 'sam@example.com')
        ->click('Confirm booking')
        ->assertSee("You're booked in");

    $appointment = Appointment::query()->sole();

    expect($appointment->service_id)->toBe($second->id)
        ->and($appointment->specialist_id)->toBe($colleague->id)
        ->and($appointment->location_id)->toBe($setup['location']->id);
});
