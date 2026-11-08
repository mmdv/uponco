<?php

use App\Enums\TeamRole;
use App\Models\Location;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

/**
 * An onsite, fixed-price service payload for the owner's current team.
 *
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function apiServicePayload(User $owner, array $overrides = []): array
{
    return array_merge([
        'service_category_id' => null,
        'is_active' => true,
        'title' => 'Haircut',
        'price_type' => 'fixed',
        'price' => 50,
        'price_min' => null,
        'price_max' => null,
        'currency' => 'AZN',
        'duration' => 60,
        'technical_break' => 10,
        'slot_interval' => null,
        'service_type' => 'individual',
        'delivery_type' => 'onsite',
        'online_meeting_provider' => null,
        'capacity' => null,
        'description' => null,
        'location_ids' => [Location::factory()->for($owner->currentTeam)->create()->id],
        'user_ids' => [],
        'specialist_pricing' => [],
    ], $overrides);
}

test('service endpoints require a token', function () {
    $this->getJson(route('api.v1.services.index'))->assertUnauthorized();
});

test('members cannot manage services', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $owner->currentTeam->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($owner->currentTeam);
    Sanctum::actingAs($member);

    $this->getJson(route('api.v1.services.index'))->assertForbidden();
    $this->postJson(route('api.v1.services.store'), apiServicePayload($owner))->assertForbidden();

    expect(Service::count())->toBe(0);
});

test('owners list their team\'s services by title with assignments and specialist pricing', function () {
    $owner = User::factory()->create();
    $team = $owner->currentTeam;
    $location = Location::factory()->for($team)->create();
    $zeta = Service::factory()->create(['team_id' => $team->id, 'title' => 'Zeta']);
    $alpha = Service::factory()->create(['team_id' => $team->id, 'title' => 'Alpha']);
    $alpha->locations()->sync([$location->id]);
    $alpha->specialists()->sync([$owner->id => ['duration' => 45, 'price' => null, 'price_min' => null, 'price_max' => null]]);
    Service::factory()->create(['title' => 'Other team']);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.services.index'))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $alpha->id)
        ->assertJsonPath('data.0.location_ids', [$location->id])
        ->assertJsonPath('data.0.user_ids', [$owner->id])
        ->assertJsonPath("data.0.specialist_pricing.{$owner->id}.duration", 45)
        ->assertJsonPath('data.1.id', $zeta->id);
});

test('an owner creates an onsite service with locations and specialists', function () {
    $owner = User::factory()->create();
    $payload = apiServicePayload($owner, ['user_ids' => [$owner->id]]);
    Sanctum::actingAs($owner);

    $this->postJson(route('api.v1.services.store'), $payload)
        ->assertCreated()
        ->assertJsonPath('data.title', 'Haircut')
        ->assertJsonPath('data.price', '50.00')
        ->assertJsonPath('data.location_ids', $payload['location_ids']);

    $service = Service::sole();

    expect($service->team_id)->toBe($owner->currentTeam->id)
        ->and($service->specialists()->pluck('users.id')->all())->toBe([$owner->id]);
});

test('an online group service needs a meeting provider and a capacity', function () {
    $owner = User::factory()->create();
    Sanctum::actingAs($owner);
    // Online services leave location_ids out: the shared rule rejects an empty list.
    $online = fn (array $overrides): array => collect(apiServicePayload($owner, $overrides))->except('location_ids')->all();

    $this->postJson(route('api.v1.services.store'), $online([
        'delivery_type' => 'online',
        'service_type' => 'group',
    ]))->assertUnprocessable()
        ->assertJsonValidationErrors(['online_meeting_provider', 'capacity']);

    $this->postJson(route('api.v1.services.store'), $online([
        'delivery_type' => 'online',
        'online_meeting_provider' => 'google_meet',
        'service_type' => 'group',
        'capacity' => 8,
    ]))->assertCreated()
        ->assertJsonPath('data.capacity', 8)
        ->assertJsonPath('data.online_meeting_provider', 'google_meet');
});

test('an onsite service needs a location', function () {
    $owner = User::factory()->create();
    Sanctum::actingAs($owner);

    $this->postJson(route('api.v1.services.store'), apiServicePayload($owner, ['location_ids' => []]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['location_ids' => __('Onsite services need at least one location.')]);
});

test('updating keeps specialist pricing the app sends back unchanged', function () {
    $owner = User::factory()->create();
    $service = Service::factory()->create(['team_id' => $owner->currentTeam->id, 'price_type' => 'fixed', 'price' => 40]);
    $service->specialists()->sync([$owner->id => ['duration' => 45, 'price' => '55.00', 'price_min' => null, 'price_max' => null]]);
    Sanctum::actingAs($owner);

    $this->patchJson(route('api.v1.services.update', $service), apiServicePayload($owner, [
        'title' => 'Renamed',
        'user_ids' => [$owner->id],
        'specialist_pricing' => [$owner->id => ['duration' => 45, 'price' => '55.00', 'price_min' => null, 'price_max' => null]],
    ]))->assertOk()
        ->assertJsonPath('data.title', 'Renamed');

    $pivot = $service->specialists()->first()->pivot;

    expect($pivot->duration)->toBe(45)
        ->and((float) $pivot->price)->toBe(55.0);
});

test('an owner deletes a service (soft delete)', function () {
    $owner = User::factory()->create();
    $service = Service::factory()->create(['team_id' => $owner->currentTeam->id]);
    Sanctum::actingAs($owner);

    $this->deleteJson(route('api.v1.services.destroy', $service))->assertNoContent();

    expect(Service::find($service->id))->toBeNull()
        ->and(Service::withTrashed()->find($service->id))->not->toBeNull();
});

test('another team\'s service is not found', function () {
    $owner = User::factory()->create();
    $foreign = Service::factory()->create(['title' => 'Foreign']);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.services.show', $foreign))->assertNotFound();
    $this->patchJson(route('api.v1.services.update', $foreign), apiServicePayload($owner))->assertNotFound();
    $this->deleteJson(route('api.v1.services.destroy', $foreign))->assertNotFound();

    expect($foreign->fresh()->title)->toBe('Foreign');
});

test('the form options list the team\'s categories, locations and members', function () {
    $owner = User::factory()->create();
    $team = $owner->currentTeam;
    $category = ServiceCategory::factory()->create(['team_id' => $team->id, 'name' => 'Hair']);
    $location = Location::factory()->for($team)->create(['name' => 'Main']);
    ServiceCategory::factory()->create(['name' => 'Other team']);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.services.options'))
        ->assertOk()
        ->assertJsonPath('data.categories', [['value' => $category->id, 'label' => 'Hair']])
        ->assertJsonPath('data.locations', [['value' => $location->id, 'label' => 'Main']])
        ->assertJsonPath('data.specialists', [['value' => $owner->id, 'label' => $owner->name]])
        ->assertJsonPath('data.currencies', ['EUR', 'USD', 'AZN'])
        ->assertJsonPath('data.meeting_providers', ['google_meet', 'custom'])
        ->assertJsonPath('data.google.connected', false);
});

test('a category can be created from the service form, unique per team', function () {
    $owner = User::factory()->create();
    Sanctum::actingAs($owner);

    $this->postJson(route('api.v1.service-categories.store'), ['name' => 'Nails'])
        ->assertCreated()
        ->assertJsonPath('data.label', 'Nails');

    $this->postJson(route('api.v1.service-categories.store'), ['name' => 'Nails'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);

    expect(ServiceCategory::where('team_id', $owner->currentTeam->id)->count())->toBe(1);
});
