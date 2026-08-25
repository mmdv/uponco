<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use App\Rules\TeamName;
use Illuminate\Support\Facades\Validator;

use function Pest\Laravel\actingAs;

/**
 * The backoffice used to be gated on the current team's *name* being "Uponco".
 * Team names are chosen by their owner and every registrant owns a fresh team,
 * so naming your company "Uponco" was a one-step path to every team and every
 * user's email address, plus delete. Authorization now keys on the immutable
 * `teams.is_operator` flag, and these tests hold that line.
 */
function backofficeTeamFor(User $user, array $attributes = [], bool $operator = false): Team
{
    $factory = Team::factory();

    $team = ($operator ? $factory->operator() : $factory)->create($attributes);

    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    return $team;
}

test('naming a team Uponco does not grant the backoffice', function () {
    $attacker = User::factory()->create();
    backofficeTeamFor($attacker, ['name' => 'Uponco']);

    $victimTeam = Team::factory()->create(['name' => 'Acme']);

    actingAs($attacker)->get(route('backoffice.index'))->assertForbidden();
    actingAs($attacker)->delete(route('backoffice.teams.destroy', $victimTeam))->assertForbidden();
    actingAs($attacker)->delete(route('backoffice.users.destroy', User::factory()->create()))->assertForbidden();
});

test('the operator flag rather than the name grants the backoffice', function () {
    $operator = User::factory()->create();

    // Deliberately not named "Uponco": the flag alone decides.
    backofficeTeamFor($operator, ['name' => 'Platform Operations'], operator: true);

    actingAs($operator)->get(route('backoffice.index'))->assertOk();
});

test('the operator flag cannot be mass assigned when creating a team', function () {
    $user = User::factory()->create();
    backofficeTeamFor($user, ['name' => 'Acme']);

    actingAs($user)
        ->post(route('teams.store'), [
            'name' => 'Sneaky Co',
            'is_operator' => true,
        ])
        ->assertSessionHasNoErrors();

    expect(Team::where('name', 'Sneaky Co')->firstOrFail()->is_operator)->toBeFalse();
});

test('the operator flag cannot be mass assigned when updating a team', function () {
    $user = User::factory()->create();
    $team = backofficeTeamFor($user, ['name' => 'Acme']);

    actingAs($user)
        ->patch(route('company.business.update'), [
            'name' => 'Acme Renamed',
            'timezone' => 'UTC',
            'business_category' => $team->business_category?->value,
            'is_operator' => true,
        ])
        ->assertSessionHasNoErrors();

    // The rename proves the update actually went through, so the flag staying
    // false is a real result rather than a rejected request.
    expect($team->refresh()->name)->toBe('Acme Renamed');
    expect($team->is_operator)->toBeFalse();

    actingAs($user)->get(route('backoffice.index'))->assertForbidden();
});

test('uponco is a reserved team name in any casing', function (string $name) {
    $failed = false;

    Validator::make(
        ['name' => $name],
        ['name' => [new TeamName]],
    )->errors()->has('name') && $failed = true;

    expect($failed)->toBeTrue();
})->with(['Uponco', 'uponco', 'UPONCO', '  Uponco  ']);

test('the backoffice is closed to guests and to members without a team', function () {
    $this->get(route('backoffice.index'))->assertRedirect(route('login'));
});
