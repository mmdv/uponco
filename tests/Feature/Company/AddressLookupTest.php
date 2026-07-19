<?php

use App\Enums\TeamRole;
use App\Models\User;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config()->set('services.google.places_key', 'test-key');
    cache()->flush();
});

test('address suggestions are returned for a typed query', function () {
    Http::fake([
        'places.googleapis.com/v1/places:autocomplete' => Http::response([
            'suggestions' => [
                [
                    'placePrediction' => [
                        'placeId' => 'ChIJabc',
                        'structuredFormat' => [
                            'mainText' => ['text' => 'Stephansplatz 1'],
                            'secondaryText' => ['text' => 'Vienna, Austria'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->getJson(route('company.locations.address.suggest', [
            'current_team' => $user->currentTeam->slug,
            'query' => 'Stephansplatz',
            'country' => 'AT',
        ]))
        ->assertOk()
        ->assertJsonPath('suggestions.0.place_id', 'ChIJabc')
        ->assertJsonPath('suggestions.0.main_text', 'Stephansplatz 1');
});

test('a selected suggestion resolves to storable address fields and coordinates', function () {
    Http::fake([
        'places.googleapis.com/v1/places/*' => Http::response([
            'id' => 'ChIJabc',
            'formattedAddress' => 'Stephansplatz 1, 1010 Wien, Austria',
            'location' => ['latitude' => 48.2085, 'longitude' => 16.373],
            'addressComponents' => [
                ['longText' => '1', 'shortText' => '1', 'types' => ['street_number']],
                ['longText' => 'Stephansplatz', 'shortText' => 'Stephansplatz', 'types' => ['route']],
                ['longText' => 'Vienna', 'shortText' => 'Vienna', 'types' => ['locality']],
                ['longText' => '1010', 'shortText' => '1010', 'types' => ['postal_code']],
                ['longText' => 'Austria', 'shortText' => 'AT', 'types' => ['country']],
            ],
        ]),
    ]);

    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->getJson(route('company.locations.address.resolve', [
            'current_team' => $user->currentTeam->slug,
            'place_id' => 'ChIJabc',
        ]))
        ->assertOk()
        ->assertJsonPath('place.latitude', 48.2085)
        ->assertJsonPath('place.longitude', 16.373)
        ->assertJsonPath('place.city', 'Vienna')
        ->assertJsonPath('place.postal_code', '1010')
        ->assertJsonPath('place.country', 'AT')
        ->assertJsonPath('place.formatted_address', 'Stephansplatz 1, 1010 Wien, Austria');
});

test('an unresolvable place id is reported rather than silently saved', function () {
    Http::fake([
        'places.googleapis.com/v1/places/*' => Http::response(['error' => 'not found'], 404),
    ]);

    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->getJson(route('company.locations.address.resolve', [
            'current_team' => $user->currentTeam->slug,
            'place_id' => 'nonsense',
        ]))
        ->assertStatus(422);
});

test('repeated lookups for the same query are only billed once', function () {
    Http::fake([
        'places.googleapis.com/v1/places:autocomplete' => Http::response(['suggestions' => []]),
    ]);

    $user = User::factory()->create();
    $team = $user->currentTeam;

    foreach (range(1, 3) as $ignored) {
        $this
            ->actingAs($user)
            ->getJson(route('company.locations.address.suggest', [
                'current_team' => $team->slug,
                'query' => 'Stephansplatz',
            ]))
            ->assertOk();
    }

    Http::assertSentCount(1);
});

test('members cannot reach the address lookup endpoints', function () {
    $owner = User::factory()->create();
    $team = $owner->currentTeam;

    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($team);

    $this
        ->actingAs($member)
        ->getJson(route('company.locations.address.suggest', [
            'current_team' => $team->slug,
            'query' => 'Stephansplatz',
        ]))
        ->assertForbidden();
});

test('the lookup degrades quietly when no places key is configured', function () {
    config()->set('services.google.places_key', null);
    Http::fake();

    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->getJson(route('company.locations.address.suggest', [
            'current_team' => $user->currentTeam->slug,
            'query' => 'Stephansplatz',
        ]))
        ->assertOk()
        ->assertJsonPath('suggestions', []);

    Http::assertNothingSent();
});
