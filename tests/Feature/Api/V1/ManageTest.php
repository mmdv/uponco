<?php

use App\Enums\TeamRole;
use App\Models\Location;
use App\Models\Service;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('the manage overview requires a token', function () {
    $this->getJson(route('api.v1.manage.show'))->assertUnauthorized();
});

test('members cannot open the manage overview', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $owner->currentTeam->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($owner->currentTeam);
    Sanctum::actingAs($member);

    $this->getJson(route('api.v1.manage.show'))->assertForbidden();
});

test('the manage overview summarises the team, hours, locations and services', function () {
    $owner = User::factory()->create(['name' => 'Ada Owner']);
    $team = $owner->currentTeam;
    $admin = User::factory()->create(['name' => 'Ben Admin']);
    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);
    Location::factory()->for($team)->create(['city' => 'Baku']);
    Service::factory()->for($team)->create(['title' => 'Haircut', 'duration' => 30]);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.manage.show'))
        ->assertOk()
        ->assertJsonPath('data.team.name', $team->name)
        ->assertJsonPath('data.business.total', 2)
        ->assertJsonPath('data.business.people.0.name', 'Ada Owner')
        ->assertJsonPath('data.locations.count', 1)
        ->assertJsonPath('data.locations.cities', ['Baku'])
        ->assertJsonPath('data.services.count', 1)
        ->assertJsonPath('data.services.items.0.title', 'Haircut')
        ->assertJsonCount(7, 'data.schedule.days');
});
