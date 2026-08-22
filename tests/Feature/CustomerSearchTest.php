<?php

use App\Models\Customer;
use App\Models\User;

test('customer search requires authentication', function () {
    $this->get(route('customers.search', ['search' => 'jane']))
        ->assertRedirect(route('login'));
});

test('customer search matches by name, email, or phone', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $byName = Customer::factory()->for($team)->create([
        'name' => 'Jane Doe',
        'email' => 'unrelated@example.com',
        'phone' => '+1 000 000 0000',
    ]);
    $byEmail = Customer::factory()->for($team)->create([
        'name' => 'Someone Else',
        'email' => 'target@example.com',
        'phone' => '+1 111 111 1111',
    ]);
    $byPhone = Customer::factory()->for($team)->create([
        'name' => 'Another Person',
        'email' => 'nope@example.com',
        'phone' => '+1 555 987 6543',
    ]);

    $this->actingAs($user)
        ->getJson(route('customers.search', ['search' => 'Jane']))
        ->assertOk()
        ->assertJsonPath('customers.0.id', $byName->id)
        ->assertJsonCount(1, 'customers');

    $this->actingAs($user)
        ->getJson(route('customers.search', ['search' => 'target@example.com']))
        ->assertJsonPath('customers.0.id', $byEmail->id)
        ->assertJsonCount(1, 'customers');

    $this->actingAs($user)
        ->getJson(route('customers.search', ['search' => '987 6543']))
        ->assertJsonPath('customers.0.id', $byPhone->id)
        ->assertJsonCount(1, 'customers');
});

test('customer search only returns the current team customers', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $mine = Customer::factory()->for($team)->create(['name' => 'Shared Name']);

    $otherUser = User::factory()->create();
    Customer::factory()->for($otherUser->currentTeam)->create(['name' => 'Shared Name']);

    $this->actingAs($user)
        ->getJson(route('customers.search', ['search' => 'Shared Name']))
        ->assertOk()
        ->assertJsonCount(1, 'customers')
        ->assertJsonPath('customers.0.id', $mine->id);
});

test('customer search caps results at 20', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    Customer::factory()->for($team)->count(25)->create(['name' => 'Match Me']);

    $this->actingAs($user)
        ->getJson(route('customers.search', ['search' => 'Match Me']))
        ->assertOk()
        ->assertJsonCount(20, 'customers');
});
