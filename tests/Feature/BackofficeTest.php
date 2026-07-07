<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;

/**
 * Create the single "Uponco" operator team with the given user as owner.
 */
function uponcoTeam(User $owner): Team
{
    $team = Team::factory()->create(['name' => 'Uponco']);
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $owner->switchTeam($team);

    return $team;
}

test('members of the uponco team can view the backoffice', function () {
    $operator = User::factory()->create();
    $uponco = uponcoTeam($operator);

    $other = Team::factory()->create(['name' => 'Acme']);
    $other->members()->attach(User::factory()->create(), ['role' => TeamRole::Owner->value]);

    $this->actingAs($operator)
        ->get(route('backoffice.index', ['current_team' => $uponco->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('backoffice/index')
            ->has('teams', Team::count())
            ->where('teams', fn ($teams) => collect($teams)->contains('name', 'Uponco')
                && collect($teams)->contains('name', 'Acme'))
        );
});

test('non uponco members cannot access the backoffice', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create(['name' => 'Acme']);
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    $this->actingAs($user)
        ->get(route('backoffice.index', ['current_team' => $team->slug]))
        ->assertForbidden();
});

test('deleting a team requires the typed name to match', function () {
    $operator = User::factory()->create();
    $uponco = uponcoTeam($operator);

    $target = Team::factory()->create(['name' => 'Acme']);
    $target->members()->attach(User::factory()->create(), ['role' => TeamRole::Owner->value]);

    $this->actingAs($operator)
        ->from(route('backoffice.index', ['current_team' => $uponco->slug]))
        ->delete(route('backoffice.teams.destroy', ['current_team' => $uponco->slug, 'team' => $target->slug]), ['name' => 'Wrong'])
        ->assertSessionHasErrors('name');

    $this->assertDatabaseHas('teams', ['id' => $target->id, 'deleted_at' => null]);
});

test('deleting a team with the matching name removes it and its memberships', function () {
    $operator = User::factory()->create();
    $uponco = uponcoTeam($operator);

    $member = User::factory()->create();
    $target = Team::factory()->create(['name' => 'Acme']);
    $target->members()->attach($member, ['role' => TeamRole::Owner->value]);

    $this->actingAs($operator)
        ->delete(route('backoffice.teams.destroy', ['current_team' => $uponco->slug, 'team' => $target->slug]), ['name' => 'Acme'])
        ->assertRedirect();

    $this->assertSoftDeleted('teams', ['id' => $target->id]);
    $this->assertDatabaseMissing('team_members', ['team_id' => $target->id]);
});

test('the uponco team itself cannot be deleted', function () {
    $operator = User::factory()->create();
    $uponco = uponcoTeam($operator);

    $this->actingAs($operator)
        ->from(route('backoffice.index', ['current_team' => $uponco->slug]))
        ->delete(route('backoffice.teams.destroy', ['current_team' => $uponco->slug, 'team' => $uponco->slug]), ['name' => 'Uponco'])
        ->assertSessionHasErrors('name');

    $this->assertDatabaseHas('teams', ['id' => $uponco->id, 'deleted_at' => null]);
});

test('deleting a user removes their team memberships', function () {
    $operator = User::factory()->create();
    $uponco = uponcoTeam($operator);

    $target = User::factory()->create();
    $team = Team::factory()->create(['name' => 'Acme']);
    $team->members()->attach($target, ['role' => TeamRole::Owner->value]);

    $this->actingAs($operator)
        ->delete(route('backoffice.users.destroy', ['current_team' => $uponco->slug, 'user' => $target->id]))
        ->assertRedirect();

    $this->assertDatabaseMissing('users', ['id' => $target->id]);
    $this->assertDatabaseMissing('team_members', ['user_id' => $target->id]);
});
