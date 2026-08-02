<?php

use App\Enums\TeamRole;
use App\Models\Customer;
use App\Models\Team;
use App\Models\User;

test('teams can be created', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('teams.store'), [
            'name' => 'Test Team',
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('teams', [
        'name' => 'Test Team',
        'is_personal' => false,
    ]);
});

test('team slug uses next available suffix', function () {
    $user = User::factory()->create();

    Team::factory()->create(['name' => 'Acme', 'slug' => 'acme']);
    Team::factory()->create(['name' => 'Acme One', 'slug' => 'acme-1']);
    Team::factory()->create(['name' => 'Acme Ten', 'slug' => 'acme-10']);

    // Distinct name (team names are unique) that still slugifies to "acme".
    $this
        ->actingAs($user)
        ->post(route('teams.store'), [
            'name' => 'Acme!',
        ]);

    $this->assertDatabaseHas('teams', [
        'name' => 'Acme!',
        'slug' => 'acme-11',
    ]);
});

test('users can switch teams', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($user, ['role' => TeamRole::Member->value]);

    $response = $this
        ->actingAs($user)
        ->post(route('teams.switch', $team));

    // URLs no longer carry a team, so the switch lands on the dashboard rather
    // than back on a page that may reference the previous team's records.
    $response->assertRedirect(route('dashboard'));

    expect($user->fresh()->current_team_id)->toEqual($team->id);
});

test('switching to a team that has not been onboarded lands on the onboard gate', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create([
        'name' => null,
        'timezone' => null,
        'business_category' => null,
    ]);
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($user)
        ->post(route('teams.switch', $team))
        ->assertRedirect(route('dashboard'));

    $this
        ->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('onboard.show'));
});

test('a user without a current team falls back to one they belong to', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $user->forceFill(['current_team_id' => null])->save();

    // Reload so the acting user carries no cached currentTeam relation, the
    // way a real request resolves it.
    $this
        ->actingAs($user->fresh())
        ->get(route('customers.index'))
        ->assertOk();

    expect($user->fresh()->current_team_id)->toEqual($team->id);
});

test('a user belonging to no team is refused team scoped pages', function () {
    $user = User::factory()->create();
    $user->teams()->detach();
    $user->forceFill(['current_team_id' => null])->save();

    $this
        ->actingAs($user->fresh())
        ->get(route('customers.index'))
        ->assertForbidden();
});

test('team scoped pages follow the current team rather than the url', function () {
    $user = User::factory()->create();
    $first = $user->currentTeam;

    $second = Team::factory()->create();
    $second->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $firstCustomer = Customer::factory()->for($first)->create();
    $secondCustomer = Customer::factory()->for($second)->create();

    $this
        ->actingAs($user)
        ->get(route('customers.index'))
        ->assertInertia(fn ($page) => $page
            ->has('customers.data', 1)
            ->where('customers.data.0.id', $firstCustomer->id)
        );

    $user->switchTeam($second);

    $this
        ->actingAs($user)
        ->get(route('customers.index'))
        ->assertInertia(fn ($page) => $page
            ->has('customers.data', 1)
            ->where('customers.data.0.id', $secondCustomer->id)
        );
});

test('users cannot switch to team they dont belong to', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('teams.switch', $team));

    $response->assertForbidden();
});
