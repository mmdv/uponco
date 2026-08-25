<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;

use function Pest\Laravel\actingAs;

/**
 * A team admin can create member accounts outright, choosing both the address
 * and the password. Those accounts used to be born with `email_verified_at`
 * set, so an admin could mint a pre-verified account at an address they do not
 * own — squatting it, and locking the real owner out of registering — and the
 * password only had to clear `min:8`.
 */
function adminOfTeam(): array
{
    $admin = User::factory()->create();
    $team = Team::factory()->create(['name' => 'Acme']);

    $team->members()->attach($admin, ['role' => TeamRole::Owner->value]);
    $admin->switchTeam($team);

    return [$admin, $team];
}

test('an admin cannot mint a pre-verified account at an address they do not own', function () {
    [$admin] = adminOfTeam();

    actingAs($admin)
        ->post(route('company.business.members.store'), [
            'name' => 'Victim',
            'email' => 'victim@othercompany.com',
            'password' => 'Str0ng-Passw0rd!',
            'password_confirmation' => 'Str0ng-Passw0rd!',
        ])
        ->assertSessionHasNoErrors();

    expect(User::where('email', 'victim@othercompany.com')->firstOrFail()->email_verified_at)
        ->toBeNull();
});

test('member passwords must clear the shared password rules', function (array $payload, string $field) {
    [$admin] = adminOfTeam();

    actingAs($admin)
        ->post(route('company.business.members.store'), array_merge([
            'name' => 'Jane',
            'email' => 'jane@example.com',
        ], $payload))
        ->assertSessionHasErrors($field);

    expect(User::where('email', 'jane@example.com')->exists())->toBeFalse();
})->with([
    'too short' => [['password' => 'short', 'password_confirmation' => 'short'], 'password'],
    'unconfirmed' => [['password' => 'Str0ng-Passw0rd!', 'password_confirmation' => 'different'], 'password'],
    'missing confirmation' => [['password' => 'Str0ng-Passw0rd!'], 'password'],
]);
