<?php

use App\Mcp\Prompts\BookCustomerPrompt;
use App\Mcp\Prompts\SummarizeDayPrompt;
use App\Mcp\Servers\UponcoServer;
use App\Mcp\Tools\AddCustomerTool;
use App\Mcp\Tools\CreateServiceTool;
use App\Mcp\Tools\UpdateCustomerTool;
use App\Mcp\Tools\UpdateServiceTool;
use App\Models\Customer;
use App\Models\Service;

test('add-customer adds a customer to the business with the customers page rules', function () {
    $setup = bookableSetup();

    UponcoServer::actingAs($setup['user'])
        ->tool(AddCustomerTool::class, ['name' => 'Aysel Mammadova', 'phone' => '+994 50 111 22 33'])
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json->where('customer.name', 'Aysel Mammadova')->etc());

    expect($setup['team']->customers()->sole()->phone)->toBe('+994 50 111 22 33');

    UponcoServer::actingAs($setup['user'])
        ->tool(AddCustomerTool::class, ['name' => 'No Contact'])
        ->assertHasErrors(['Enter an email or a phone number so you can contact the customer.']);
});

test('update-customer changes only the fields it is given', function () {
    $setup = bookableSetup();
    $customer = Customer::factory()->for($setup['team'])->create(['name' => 'Old Name', 'email' => 'a@example.com', 'phone' => '+994 50 000 00 00']);

    UponcoServer::actingAs($setup['user'])
        ->tool(UpdateCustomerTool::class, ['customer_id' => $customer->id, 'name' => 'New Name', 'phone' => ''])
        ->assertOk();

    expect($customer->refresh())
        ->name->toBe('New Name')
        ->email->toBe('a@example.com')
        ->phone->toBeNull();

    UponcoServer::actingAs($setup['user'])
        ->tool(UpdateCustomerTool::class, ['customer_id' => $customer->id, 'email' => ''])
        ->assertHasErrors(['Enter an email or a phone number']);

    UponcoServer::actingAs($setup['user'])
        ->tool(UpdateCustomerTool::class, ['customer_id' => Customer::factory()->create()->id, 'name' => 'X'])
        ->assertHasErrors(['Customer not found.']);
});

test('create-service adds a bookable service for owners and admins only', function () {
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);
    $arguments = [
        'title' => 'Beard trim',
        'duration_minutes' => 30,
        'price_type' => 'fixed',
        'price' => 15,
        'currency' => 'AZN',
        'location_ids' => [$setup['location']->id],
        'specialist_ids' => [$setup['user']->id, $member->id],
    ];

    UponcoServer::actingAs($member)
        ->tool(CreateServiceTool::class, $arguments)
        ->assertHasErrors(['Only owners and admins can change services.']);

    UponcoServer::actingAs($setup['user'])
        ->tool(CreateServiceTool::class, $arguments)
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json->where('service.title', 'Beard trim')->where('service.is_active', true)->etc());

    $service = Service::where('title', 'Beard trim')->sole();
    expect($service->team_id)->toBe($setup['team']->id)
        ->and($service->duration)->toBe(30)
        ->and($service->specialists()->pluck('users.id')->sort()->values()->all())->toBe(collect([$setup['user']->id, $member->id])->sort()->values()->all());

    UponcoServer::actingAs($setup['user'])
        ->tool(CreateServiceTool::class, [...$arguments, 'location_ids' => []])
        ->assertHasErrors(['Onsite services need at least one location.']);
});

test('update-service changes the given fields and keeps the rest, including specialist overrides', function () {
    $setup = bookableSetup(['price_type' => 'fixed', 'price' => 20]);
    $setup['service']->specialists()->updateExistingPivot($setup['user']->id, ['duration' => 45, 'price' => 25]);

    UponcoServer::actingAs($setup['user'])
        ->tool(UpdateServiceTool::class, ['service_id' => $setup['service']->id, 'price' => 30, 'is_active' => false])
        ->assertOk();

    $service = $setup['service']->refresh();
    $pivot = $service->specialists()->first()->pivot;

    expect($service->price)->toBe('30.00')
        ->and($service->is_active)->toBeFalse()
        ->and($service->duration)->toBe(60)
        ->and($service->locations()->pluck('locations.id')->all())->toBe([$setup['location']->id])
        ->and($pivot->duration)->toBe(45)
        ->and((float) $pivot->price)->toBe(25.0);

    UponcoServer::actingAs($setup['user'])
        ->tool(UpdateServiceTool::class, ['service_id' => bookableSetup()['service']->id, 'price' => 1])
        ->assertHasErrors(['Service not found.']);
});

test('prompts fill in the user\'s arguments', function () {
    UponcoServer::prompt(SummarizeDayPrompt::class, ['day' => 'tomorrow'])
        ->assertOk()
        ->assertSee('Give me a briefing on my Uponco day for tomorrow.');

    UponcoServer::prompt(BookCustomerPrompt::class, ['customer' => 'Aysel', 'service' => 'Haircut'])
        ->assertOk()
        ->assertSee(['Book Aysel for Haircut, the next free time', 'only after I confirm']);
});
