<?php

use App\Enums\TeamRole;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

/** A member (not admin) of the owner's current team. */
function apiCustomerMember(User $owner): User
{
    $member = User::factory()->create();
    $owner->currentTeam->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($owner->currentTeam);

    return $member;
}

test('customer endpoints require a token', function () {
    $this->getJson(route('api.v1.customers.index'))->assertUnauthorized();
});

test('customers are listed by name, paginated, without other teams', function () {
    $owner = User::factory()->create();
    $team = $owner->currentTeam;
    Customer::factory()->create(['team_id' => $team->id, 'name' => 'Zara']);
    Customer::factory()->create(['team_id' => $team->id, 'name' => 'Aysel']);
    Customer::factory()->create(['name' => 'Someone elsewhere']);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.customers.index'))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.name', 'Aysel')
        ->assertJsonPath('data.1.name', 'Zara')
        ->assertJsonPath('meta.total', 2)
        ->assertJsonPath('meta.per_page', 50);
});

test('search matches name, email or phone', function () {
    $owner = User::factory()->create();
    $team = $owner->currentTeam;
    Customer::factory()->create(['team_id' => $team->id, 'name' => 'Leyla', 'email' => 'leyla@example.test', 'phone' => '+994501112233']);
    Customer::factory()->create(['team_id' => $team->id, 'name' => 'Murad', 'email' => 'murad@example.test', 'phone' => '+994559998877']);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.customers.index', ['search' => 'leyla@']))
        ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Leyla');

    $this->getJson(route('api.v1.customers.index', ['search' => '99887']))
        ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Murad');
});

test('members can manage customers, as on the web', function () {
    $owner = User::factory()->create();
    $member = apiCustomerMember($owner);
    Sanctum::actingAs($member);

    $this->postJson(route('api.v1.customers.store'), ['name' => 'Nigar', 'phone' => '+994501234567'])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Nigar');

    expect(Customer::sole()->team_id)->toBe($owner->currentTeam->id);
});

test('a customer needs a name and an email or a phone', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson(route('api.v1.customers.store'), ['name' => '', 'email' => null, 'phone' => null])
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'name',
            'email' => __('Enter an email or a phone number so you can contact the customer.'),
        ]);

    expect(Customer::count())->toBe(0);
});

test('a customer can be updated and deleted (soft)', function () {
    $owner = User::factory()->create();
    $customer = Customer::factory()->create(['team_id' => $owner->currentTeam->id, 'name' => 'Old']);
    Sanctum::actingAs($owner);

    $this->patchJson(route('api.v1.customers.update', $customer), ['name' => 'New', 'email' => 'new@example.test', 'phone' => null])
        ->assertOk()
        ->assertJsonPath('data.name', 'New');

    $this->deleteJson(route('api.v1.customers.destroy', $customer))->assertNoContent();

    expect(Customer::find($customer->id))->toBeNull()
        ->and(Customer::withTrashed()->find($customer->id)->name)->toBe('New');
});

test('another team\'s customer is not found', function () {
    $owner = User::factory()->create();
    $foreign = Customer::factory()->create(['name' => 'Foreign']);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.customers.show', $foreign))->assertNotFound();
    $this->patchJson(route('api.v1.customers.update', $foreign), ['name' => 'X', 'phone' => '1'])->assertNotFound();
    $this->deleteJson(route('api.v1.customers.destroy', $foreign))->assertNotFound();

    expect($foreign->fresh()->name)->toBe('Foreign');
});

test('the detail shows the customer\'s appointments newest first', function () {
    $owner = User::factory()->create();
    $team = $owner->currentTeam;
    $customer = Customer::factory()->create(['team_id' => $team->id]);
    $older = Appointment::factory()->create(['team_id' => $team->id, 'customer_id' => $customer->id, 'specialist_id' => $owner->id, 'start_at' => now()->subWeek()]);
    $newer = Appointment::factory()->create(['team_id' => $team->id, 'customer_id' => $customer->id, 'specialist_id' => $owner->id, 'start_at' => now()->addDay()]);
    Appointment::factory()->create(['team_id' => $team->id, 'start_at' => now()->addDay()]);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.customers.show', $customer))
        ->assertOk()
        ->assertJsonPath('data.id', $customer->id)
        ->assertJsonCount(2, 'data.appointments')
        ->assertJsonPath('data.appointments.0.id', $newer->id)
        ->assertJsonPath('data.appointments.1.id', $older->id);
});

test('members only see their own appointments in a customer\'s history', function () {
    $owner = User::factory()->create();
    $team = $owner->currentTeam;
    $member = apiCustomerMember($owner);
    $customer = Customer::factory()->create(['team_id' => $team->id]);
    $own = Appointment::factory()->create(['team_id' => $team->id, 'customer_id' => $customer->id, 'specialist_id' => $member->id]);
    Appointment::factory()->create(['team_id' => $team->id, 'customer_id' => $customer->id, 'specialist_id' => $owner->id]);
    Sanctum::actingAs($member);

    $this->getJson(route('api.v1.customers.show', $customer))
        ->assertOk()
        ->assertJsonCount(1, 'data.appointments')
        ->assertJsonPath('data.appointments.0.id', $own->id);
});
