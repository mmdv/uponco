<?php

use App\Models\Customer;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

function customerPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'phone' => '+1 555 123 4567',
    ], $overrides);
}

test('the customers page can be rendered', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->get(route('customers.index'))
        ->assertOk();
});

test('the customers list is paginated at 50 per page', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    Customer::factory()->for($team)->count(60)->create();

    $this
        ->actingAs($user)
        ->get(route('customers.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('customers/index')
            ->where('customers.total', 60)
            ->where('customers.per_page', 50)
            ->where('customers.current_page', 1)
            ->where('customers.last_page', 2)
            ->has('customers.data', 50)
        );
});

test('the customers list can navigate to a second page', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    Customer::factory()->for($team)->count(60)->create();

    $this
        ->actingAs($user)
        ->get(route('customers.index', ['page' => 2]))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('customers.current_page', 2)
            ->has('customers.data', 10)
        );
});

test('the customers list can be searched by name, email, or phone', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    Customer::factory()->for($team)->create([
        'name' => 'Alice Wonderland',
        'email' => 'alice@example.com',
        'phone' => '+1 555 111 2222',
    ]);
    Customer::factory()->for($team)->create([
        'name' => 'Bob Builder',
        'email' => 'bob@example.com',
        'phone' => '+1 555 333 4444',
    ]);

    $assertMatchesAlice = function (string $search) use ($user) {
        $this
            ->actingAs($user)
            ->get(route('customers.index', ['search' => $search]))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('filters.search', $search)
                ->has('customers.data', 1)
                ->where('customers.data.0.name', 'Alice Wonderland')
            );
    };

    $assertMatchesAlice('Wonderland');
    $assertMatchesAlice('alice@example.com');
    $assertMatchesAlice('111 2222');
});

test('search results are scoped to the current team', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    Customer::factory()->for($team)->create(['name' => 'Shared Name']);
    Customer::factory()->create(['name' => 'Shared Name']);

    $this
        ->actingAs($user)
        ->get(route('customers.index', ['search' => 'Shared Name']))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('customers.data', 1)
        );
});

test('a customer can be created', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this
        ->actingAs($user)
        ->post(route('customers.store'), customerPayload());

    $response->assertRedirect();

    $this->assertDatabaseHas('customers', [
        'team_id' => $team->id,
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
    ]);
});

test('a customer can be created with only an email', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->post(route('customers.store'), customerPayload([
            'phone' => '',
        ]))
        ->assertRedirect();

    $this->assertDatabaseHas('customers', [
        'team_id' => $team->id,
        'email' => 'jane@example.com',
        'phone' => null,
    ]);
});

test('a customer can be created with only a phone', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->post(route('customers.store'), customerPayload([
            'email' => '',
        ]))
        ->assertRedirect();

    $this->assertDatabaseHas('customers', [
        'team_id' => $team->id,
        'phone' => '+1 555 123 4567',
        'email' => null,
    ]);
});

test('creating a customer requires a name', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->post(route('customers.store'), customerPayload([
            'name' => '',
        ]))
        ->assertSessionHasErrors('name');
});

test('creating a customer requires at least an email or a phone', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->post(route('customers.store'), customerPayload([
            'email' => '',
            'phone' => '',
        ]))
        ->assertSessionHasErrors(['email', 'phone']);
});

test('a customer can be updated', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $customer = Customer::factory()->for($team)->create();

    $this
        ->actingAs($user)
        ->patch(route('customers.update', ['customer' => $customer]), customerPayload([
            'name' => 'Updated Name',
        ]))
        ->assertRedirect();

    $this->assertDatabaseHas('customers', [
        'id' => $customer->id,
        'name' => 'Updated Name',
    ]);
});

test('a customer can be deleted', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $customer = Customer::factory()->for($team)->create();

    $this
        ->actingAs($user)
        ->delete(route('customers.destroy', ['customer' => $customer]))
        ->assertRedirect();

    $this->assertSoftDeleted($customer);
});

test('a customer from another team cannot be updated', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherCustomer = Customer::factory()->create();

    $this
        ->actingAs($user)
        ->patch(route('customers.update', ['customer' => $otherCustomer]), customerPayload())
        ->assertForbidden();
});

test('a customer from another team cannot be deleted', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $otherCustomer = Customer::factory()->create();

    $this
        ->actingAs($user)
        ->delete(route('customers.destroy', ['customer' => $otherCustomer]))
        ->assertForbidden();
});
