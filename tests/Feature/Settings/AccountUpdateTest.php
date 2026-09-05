<?php

use App\Enums\TeamRole;
use App\Models\Customer;
use App\Models\Team;
use App\Models\User;

test('the settings index redirects to the profile page', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->get('/settings')
        ->assertRedirect(route('profile.edit'));
});

test('the login email can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('account.update'), [
            'current_password' => 'password',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('security.edit'));

    $user->refresh();

    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('account.update'), [
            'current_password' => 'password',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('security.edit'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('account.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('deleting an account also deletes teams the user solely owns and their data', function () {
    $user = User::factory()->create();
    $team = $user->personalTeam();
    $customer = Customer::factory()->for($team)->create();

    $this
        ->actingAs($user)
        ->delete(route('account.destroy'), [
            'password' => 'password',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    expect($user->fresh())->toBeNull();
    $this->assertDatabaseMissing('teams', ['id' => $team->id]);
    $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
});

test('a passwordless oauth account can be deleted without a password', function () {
    $user = User::factory()->create([
        'password' => null,
        'google_id' => fake()->uuid(),
    ]);

    $this
        ->actingAs($user)
        ->delete(route('account.destroy'))
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('an account cannot be deleted while the user owns a team with other members', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $owner->switchTeam($team);

    $this
        ->actingAs($owner)
        ->from(route('security.edit'))
        ->delete(route('account.destroy'), [
            'password' => 'password',
        ])
        ->assertSessionHasErrors('teams')
        ->assertRedirect(route('security.edit'));

    expect($owner->fresh())->not->toBeNull();
    $this->assertDatabaseHas('teams', ['id' => $team->id]);
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('security.edit'))
        ->delete(route('account.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('security.edit'));

    expect($user->fresh())->not->toBeNull();
});
