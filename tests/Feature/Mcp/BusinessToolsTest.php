<?php

use App\Enums\TeamRole;
use App\Mcp\Servers\UponcoServer;
use App\Mcp\Tools\FindAvailableSlotsTool;
use App\Mcp\Tools\GetBusinessOverviewTool;
use App\Mcp\Tools\GetWorkingHoursTool;
use App\Mcp\Tools\SearchCustomersTool;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\User;

test('get-business-overview lists services, locations and specialists with their links', function () {
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);

    UponcoServer::actingAs($setup['user'])
        ->tool(GetBusinessOverviewTool::class)
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json
            ->where('you_see_all_appointments', true)
            ->where('services.0.id', $setup['service']->id)
            ->where('services.0.duration_minutes', 60)
            ->where('services.0.specialist_ids', fn ($ids) => collect($ids)->sort()->values()->all() === collect([$setup['user']->id, $member->id])->sort()->values()->all())
            ->where('locations.0.id', $setup['location']->id)
            ->has('specialists', 2)
            ->etc());
});

test('find-available-slots returns free times and skips booked ones', function () {
    $setup = bookableSetup();
    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addHour(),
    ]);

    $response = UponcoServer::actingAs($setup['user'])
        ->tool(FindAvailableSlotsTool::class, [
            'service_id' => $setup['service']->id,
            'date' => $setup['startAt']->toDateString(),
            'days' => 2,
        ])
        ->assertOk();

    $response->assertStructuredContent(fn ($json) => $json
        ->where('results.0.specialist.id', $setup['user']->id)
        ->where('results.0.days.0.date', $setup['startAt']->toDateString())
        ->where('results.0.days.0.times', fn ($times) => collect($times)->pluck('time')->doesntContain('09:00')
            && collect($times)->pluck('time')->contains('10:00'))
        ->where('results.0.days.1.times.0.time', '09:00')
        ->etc());
});

test('find-available-slots checks every specialist who offers the service unless one is named', function () {
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);
    $outsider = User::factory()->create();
    $setup['team']->members()->attach($outsider, ['role' => TeamRole::Member->value]);

    $arguments = ['service_id' => $setup['service']->id, 'date' => $setup['startAt']->toDateString()];

    UponcoServer::actingAs($setup['user'])
        ->tool(FindAvailableSlotsTool::class, $arguments)
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json->has('results', 2)->etc());

    UponcoServer::actingAs($setup['user'])
        ->tool(FindAvailableSlotsTool::class, [...$arguments, 'specialist_id' => $member->id])
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json->has('results', 1)->where('results.0.specialist.id', $member->id)->etc());

    UponcoServer::actingAs($setup['user'])
        ->tool(FindAvailableSlotsTool::class, [...$arguments, 'specialist_id' => $outsider->id])
        ->assertHasErrors(['That specialist does not offer this service.']);
});

test('find-available-slots rejects another business\'s service', function () {
    $setup = bookableSetup();
    $other = bookableSetup();

    UponcoServer::actingAs($setup['user'])
        ->tool(FindAvailableSlotsTool::class, ['service_id' => $other['service']->id, 'date' => $setup['startAt']->toDateString()])
        ->assertHasErrors(['Service not found. Use get-business-overview for the list of services.']);
});

test('get-working-hours marks days without hours as days off', function () {
    $setup = bookableSetup();
    $dayBefore = $setup['startAt']->subDay();

    UponcoServer::actingAs($setup['user'])
        ->tool(GetWorkingHoursTool::class, ['from' => $dayBefore->toDateString(), 'to' => $setup['startAt']->toDateString()])
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json
            ->where('specialist.id', $setup['user']->id)
            ->where('days.0', ['date' => $dayBefore->toDateString(), 'weekday' => $dayBefore->englishDayOfWeek, 'day_off' => true, 'hours' => []])
            ->where('days.1.day_off', false)
            ->where('days.1.hours', [['start' => '09:00', 'end' => '17:00']])
            ->etc());
});

test('get-working-hours lets owners read anyone but members only themselves', function () {
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);
    $arguments = ['from' => $setup['startAt']->toDateString()];

    UponcoServer::actingAs($setup['user'])
        ->tool(GetWorkingHoursTool::class, [...$arguments, 'specialist_id' => $member->id])
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json->where('specialist.id', $member->id)->etc());

    UponcoServer::actingAs($member)
        ->tool(GetWorkingHoursTool::class, [...$arguments, 'specialist_id' => $setup['user']->id])
        ->assertHasErrors(['You can only see your own working hours.']);
});

test('search-customers matches name, email or phone within the business only', function () {
    $setup = bookableSetup();
    $byName = Customer::factory()->for($setup['team'])->create(['name' => 'Aysel Mammadova', 'email' => 'a@example.com', 'phone' => '+994 50 111 22 33']);
    $byPhone = Customer::factory()->for($setup['team'])->create(['name' => 'Kamran Aliyev', 'email' => 'k@example.com', 'phone' => '+994 55 999 00 11']);
    Customer::factory()->create(['name' => 'Aysel Other Business']);

    UponcoServer::actingAs($setup['user'])
        ->tool(SearchCustomersTool::class, ['query' => 'aysel'])
        ->assertOk()
        ->assertStructuredContent([
            'customers' => [['id' => $byName->id, 'name' => 'Aysel Mammadova', 'email' => 'a@example.com', 'phone' => '+994 50 111 22 33']],
            'more_results' => false,
        ]);

    UponcoServer::actingAs($setup['user'])
        ->tool(SearchCustomersTool::class, ['query' => '999 00'])
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json->where('customers.0.id', $byPhone->id)->has('customers', 1)->etc());
});
