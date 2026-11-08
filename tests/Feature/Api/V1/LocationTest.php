<?php

use App\Enums\TeamRole;
use App\Models\Location;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function apiLocationPayload(array $overrides = []): array
{
    return array_merge([
        'is_active' => true,
        'name' => 'Head Office',
        'country' => 'AZ',
        'city' => 'Baku',
        'street_address' => '28 Nizami St',
        'unit' => null,
        'postal_code' => 'AZ1000',
        'phone' => '+994 12 555 0000',
        'service_ids' => [],
        'user_ids' => [],
    ], $overrides);
}

/** A member (not admin) of the given owner's current team. */
function apiLocationMember(User $owner): User
{
    $member = User::factory()->create();
    $owner->currentTeam->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($owner->currentTeam);

    return $member;
}

test('location endpoints require a token', function () {
    $this->getJson(route('api.v1.locations.index'))->assertUnauthorized();
    $this->postJson(route('api.v1.locations.store'), apiLocationPayload())->assertUnauthorized();
});

test('members cannot manage locations', function () {
    $owner = User::factory()->create();
    $member = apiLocationMember($owner);
    Sanctum::actingAs($member);

    $this->getJson(route('api.v1.locations.index'))->assertForbidden();
    $this->postJson(route('api.v1.locations.store'), apiLocationPayload())->assertForbidden();

    expect(Location::count())->toBe(0);
});

test('owners list their team\'s locations by name with assignments', function () {
    $owner = User::factory()->create();
    $team = $owner->currentTeam;
    $service = Service::factory()->create(['team_id' => $team->id]);
    $zeta = Location::factory()->create(['team_id' => $team->id, 'name' => 'Zeta']);
    $alpha = Location::factory()->create(['team_id' => $team->id, 'name' => 'Alpha']);
    $alpha->services()->sync([$service->id]);
    $alpha->specialists()->sync([$owner->id]);
    Location::factory()->create(['name' => 'Someone else']);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.locations.index'))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $alpha->id)
        ->assertJsonPath('data.0.service_ids', [$service->id])
        ->assertJsonPath('data.0.user_ids', [$owner->id])
        ->assertJsonPath('data.1.id', $zeta->id);
});

test('an owner creates a location with services and specialists', function () {
    $owner = User::factory()->create();
    $team = $owner->currentTeam;
    $service = Service::factory()->create(['team_id' => $team->id]);
    Sanctum::actingAs($owner);

    $response = $this->postJson(route('api.v1.locations.store'), apiLocationPayload([
        'service_ids' => [$service->id],
        'user_ids' => [$owner->id],
    ]));

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Head Office')
        ->assertJsonPath('data.service_ids', [$service->id]);

    $location = Location::sole();

    expect($location->team_id)->toBe($team->id)
        ->and($location->city)->toBe('Baku')
        ->and($location->specialists()->pluck('users.id')->all())->toBe([$owner->id]);
});

test('an owner updates a location, including turning it off', function () {
    $owner = User::factory()->create();
    $location = Location::factory()->create(['team_id' => $owner->currentTeam->id, 'is_active' => true]);
    Sanctum::actingAs($owner);

    $this->patchJson(route('api.v1.locations.update', $location), apiLocationPayload([
        'name' => 'Renamed',
        'is_active' => false,
    ]))->assertOk()
        ->assertJsonPath('data.name', 'Renamed')
        ->assertJsonPath('data.is_active', false);

    expect($location->fresh()->name)->toBe('Renamed')
        ->and($location->fresh()->is_active)->toBeFalse();
});

test('another team\'s location is not found', function () {
    $owner = User::factory()->create();
    $foreign = Location::factory()->create(['name' => 'Foreign']);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.locations.show', $foreign))->assertNotFound();
    $this->patchJson(route('api.v1.locations.update', $foreign), apiLocationPayload())->assertNotFound();

    expect($foreign->fresh()->name)->toBe('Foreign');
});

test('the web validation rules apply', function () {
    $owner = User::factory()->create();
    $foreignService = Service::factory()->create();
    Sanctum::actingAs($owner);

    $this->postJson(route('api.v1.locations.store'), apiLocationPayload([
        'name' => '',
        'country' => 'XX',
        'service_ids' => [$foreignService->id],
    ]))->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'country', 'service_ids.0']);

    expect(Location::count())->toBe(0);
});

test('the form options list countries and the team\'s services and members', function () {
    $owner = User::factory()->create();
    $service = Service::factory()->create(['team_id' => $owner->currentTeam->id, 'title' => 'Haircut']);
    Service::factory()->create(['title' => 'Other team service']);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.locations.options'))
        ->assertOk()
        ->assertJsonPath('data.services', [['value' => $service->id, 'label' => 'Haircut']])
        ->assertJsonPath('data.specialists', [['value' => $owner->id, 'label' => $owner->name]])
        ->assertJsonFragment(['value' => 'AZ']);
});

test('address suggestions use the same lookup as the web', function () {
    config()->set('services.google.places_key', 'test-key');
    cache()->flush();
    Http::fake([
        'places.googleapis.com/v1/places:autocomplete' => Http::response([
            'suggestions' => [[
                'placePrediction' => [
                    'placeId' => 'ChIJabc',
                    'structuredFormat' => [
                        'mainText' => ['text' => '28 Nizami St'],
                        'secondaryText' => ['text' => 'Baku, Azerbaijan'],
                    ],
                ],
            ]],
        ]),
    ]);
    Sanctum::actingAs(User::factory()->create());

    $this->getJson(route('api.v1.locations.address.suggest', ['query' => 'Nizami']))
        ->assertOk()
        ->assertJsonPath('suggestions.0.place_id', 'ChIJabc');
});
