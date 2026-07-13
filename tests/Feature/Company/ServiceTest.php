<?php

use App\Enums\TeamRole;
use App\Models\Location;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Team;
use App\Models\User;

function servicePayload(int $categoryId, array $overrides = []): array
{
    return array_merge([
        'service_category_id' => $categoryId,
        'is_active' => true,
        'title' => 'Haircut',
        'price_type' => 'fixed',
        'price' => 50,
        'duration' => 60,
        'technical_break' => 10,
        'service_type' => 'individual',
        'delivery_type' => 'onsite',
        'description' => 'A nice haircut.',
    ], $overrides);
}

test('the services page can be rendered', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this
        ->actingAs($user)
        ->get(route('company.services.index', ['current_team' => $team->slug]))
        ->assertOk();
});

test('a category can be created', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this
        ->actingAs($user)
        ->post(route('company.service-categories.store', ['current_team' => $team->slug]), [
            'name' => 'Hair',
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('service_categories', [
        'team_id' => $team->id,
        'name' => 'Hair',
    ]);
});

test('a category can be updated', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = ServiceCategory::factory()->for($team)->create(['name' => 'Old']);

    $response = $this
        ->actingAs($user)
        ->patch(route('company.service-categories.update', [
            'current_team' => $team->slug,
            'serviceCategory' => $category->id,
        ]), ['name' => 'New']);

    $response->assertRedirect();

    $this->assertDatabaseHas('service_categories', ['id' => $category->id, 'name' => 'New']);
});

test('a category can be deleted', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = ServiceCategory::factory()->for($team)->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('company.service-categories.destroy', [
            'current_team' => $team->slug,
            'serviceCategory' => $category->id,
        ]));

    $response->assertRedirect();

    $this->assertSoftDeleted('service_categories', ['id' => $category->id]);
});

test('a fixed price service can be created', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = ServiceCategory::factory()->for($team)->create();

    $response = $this
        ->actingAs($user)
        ->post(
            route('company.services.store', ['current_team' => $team->slug]),
            servicePayload($category->id),
        );

    $response->assertRedirect();

    $this->assertDatabaseHas('services', [
        'service_category_id' => $category->id,
        'title' => 'Haircut',
        'price_type' => 'fixed',
        'price' => 50,
        'price_min' => null,
        'price_max' => null,
    ]);
});

test('a free service clears price columns', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = ServiceCategory::factory()->for($team)->create();

    $this
        ->actingAs($user)
        ->post(
            route('company.services.store', ['current_team' => $team->slug]),
            servicePayload($category->id, ['price_type' => 'free', 'price' => null]),
        )
        ->assertRedirect();

    $this->assertDatabaseHas('services', [
        'price_type' => 'free',
        'price' => null,
        'price_min' => null,
        'price_max' => null,
    ]);
});

test('a range service stores min and max', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = ServiceCategory::factory()->for($team)->create();

    $this
        ->actingAs($user)
        ->post(
            route('company.services.store', ['current_team' => $team->slug]),
            servicePayload($category->id, [
                'price_type' => 'range',
                'price' => null,
                'price_min' => 30,
                'price_max' => 80,
            ]),
        )
        ->assertRedirect();

    $this->assertDatabaseHas('services', [
        'price_type' => 'range',
        'price' => null,
        'price_min' => 30,
        'price_max' => 80,
    ]);
});

test('a group online service stores capacity and provider', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = ServiceCategory::factory()->for($team)->create();

    $this
        ->actingAs($user)
        ->post(
            route('company.services.store', ['current_team' => $team->slug]),
            servicePayload($category->id, [
                'service_type' => 'group',
                'capacity' => 12,
                'delivery_type' => 'online',
                'online_meeting_provider' => 'google_meet',
            ]),
        )
        ->assertRedirect();

    $this->assertDatabaseHas('services', [
        'service_type' => 'group',
        'capacity' => 12,
        'delivery_type' => 'online',
        'online_meeting_provider' => 'google_meet',
    ]);
});

test('capacity is required for group services', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = ServiceCategory::factory()->for($team)->create();

    $this
        ->actingAs($user)
        ->post(
            route('company.services.store', ['current_team' => $team->slug]),
            servicePayload($category->id, ['service_type' => 'group', 'capacity' => null]),
        )
        ->assertSessionHasErrors(['capacity']);
});

test('an online service accepts the custom meeting provider', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = ServiceCategory::factory()->for($team)->create();

    $this
        ->actingAs($user)
        ->post(
            route('company.services.store', ['current_team' => $team->slug]),
            servicePayload($category->id, [
                'delivery_type' => 'online',
                'online_meeting_provider' => 'custom',
            ]),
        )
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('services', [
        'delivery_type' => 'online',
        'online_meeting_provider' => 'custom',
    ]);
});

test('online meeting provider is required for online services', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = ServiceCategory::factory()->for($team)->create();

    $this
        ->actingAs($user)
        ->post(
            route('company.services.store', ['current_team' => $team->slug]),
            servicePayload($category->id, ['delivery_type' => 'online', 'online_meeting_provider' => null]),
        )
        ->assertSessionHasErrors(['online_meeting_provider']);
});

test('a service cannot be created in another team category', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $otherTeam = Team::factory()->create();
    $foreignCategory = ServiceCategory::factory()->for($otherTeam)->create();

    $this
        ->actingAs($user)
        ->post(
            route('company.services.store', ['current_team' => $team->slug]),
            servicePayload($foreignCategory->id),
        )
        ->assertSessionHasErrors(['service_category_id']);
});

test('a service can be updated', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = ServiceCategory::factory()->for($team)->create();
    $service = Service::factory()->for($category, 'category')->create(['title' => 'Old']);

    $this
        ->actingAs($user)
        ->patch(
            route('company.services.update', ['current_team' => $team->slug, 'service' => $service->id]),
            servicePayload($category->id, ['title' => 'New']),
        )
        ->assertRedirect();

    $this->assertDatabaseHas('services', ['id' => $service->id, 'title' => 'New']);
});

test('a service can be created with assigned locations and specialists', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = ServiceCategory::factory()->for($team)->create();
    $location = Location::factory()->for($team)->create();
    $specialist = User::factory()->create();
    $team->members()->attach($specialist, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($user)
        ->post(
            route('company.services.store', ['current_team' => $team->slug]),
            servicePayload($category->id, [
                'location_ids' => [$location->id],
                'user_ids' => [$specialist->id],
            ]),
        )
        ->assertRedirect();

    $service = Service::firstWhere('title', 'Haircut');

    expect($service->locations->pluck('id')->all())->toEqual([$location->id]);
    expect($service->specialists->pluck('id')->all())->toEqual([$specialist->id]);
});

test('updating a service re-syncs locations and specialists', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = ServiceCategory::factory()->for($team)->create();
    $service = Service::factory()->for($category, 'category')->create();

    $oldLocation = Location::factory()->for($team)->create();
    $newLocation = Location::factory()->for($team)->create();
    $service->locations()->attach($oldLocation);

    $this
        ->actingAs($user)
        ->patch(
            route('company.services.update', ['current_team' => $team->slug, 'service' => $service->id]),
            servicePayload($category->id, ['location_ids' => [$newLocation->id]]),
        )
        ->assertRedirect();

    expect($service->locations()->pluck('locations.id')->all())->toEqual([$newLocation->id]);
});

test('a service cannot be assigned a location from another team', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = ServiceCategory::factory()->for($team)->create();
    $foreignLocation = Location::factory()->create();

    $this
        ->actingAs($user)
        ->post(
            route('company.services.store', ['current_team' => $team->slug]),
            servicePayload($category->id, ['location_ids' => [$foreignLocation->id]]),
        )
        ->assertSessionHasErrors(['location_ids.0']);
});

test('a service cannot be assigned a specialist who is not a team member', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = ServiceCategory::factory()->for($team)->create();
    $stranger = User::factory()->create();

    $this
        ->actingAs($user)
        ->post(
            route('company.services.store', ['current_team' => $team->slug]),
            servicePayload($category->id, ['user_ids' => [$stranger->id]]),
        )
        ->assertSessionHasErrors(['user_ids.0']);
});

test('a service can be deleted', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $category = ServiceCategory::factory()->for($team)->create();
    $service = Service::factory()->for($category, 'category')->create();

    $this
        ->actingAs($user)
        ->delete(route('company.services.destroy', ['current_team' => $team->slug, 'service' => $service->id]))
        ->assertRedirect();

    $this->assertSoftDeleted('services', ['id' => $service->id]);
});

test('a service cannot be updated from another team', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $otherTeam = Team::factory()->create();
    $otherTeam->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $foreignCategory = ServiceCategory::factory()->for($otherTeam)->create();
    $foreignService = Service::factory()->for($foreignCategory, 'category')->create();

    $this
        ->actingAs($user)
        ->patch(
            route('company.services.update', ['current_team' => $team->slug, 'service' => $foreignService->id]),
            servicePayload($foreignCategory->id),
        )
        ->assertForbidden();
});

test('guests cannot access services', function () {
    $team = Team::factory()->create();

    $this
        ->get(route('company.services.index', ['current_team' => $team->slug]))
        ->assertRedirect(route('login'));
});
