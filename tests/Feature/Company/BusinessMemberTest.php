<?php

use App\Enums\TeamRole;
use App\Models\Location;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Team;
use App\Models\User;

test('owners can add a team member directly', function () {
    $owner = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($owner)
        ->post(route('company.business.members.store', ['current_team' => $team->slug]), [
            'name' => 'Jane',
            'surname' => 'Doe',
            'job_title' => 'Stylist',
            'email' => 'jane@example.com',
            'password' => 'password123',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $member = User::where('email', 'jane@example.com')->first();

    expect($member)->not->toBeNull();
    expect($member->name)->toEqual('Jane Doe');
    expect($member->email_verified_at)->not->toBeNull();
    expect($member->profile->job_title)->toEqual('Stylist');
    expect($member->belongsToTeam($team))->toBeTrue();
    expect($team->members()->where('user_id', $member->id)->first()->pivot->role->value)
        ->toEqual(TeamRole::Member->value);

    expect($member->personalTeam())->toBeNull();
    expect($member->teams()->count())->toBe(1);
});

test('admins can add a team member directly', function () {
    $admin = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);

    $this
        ->actingAs($admin)
        ->post(route('company.business.members.store', ['current_team' => $team->slug]), [
            'name' => 'John',
            'surname' => 'Smith',
            'email' => 'john@example.com',
            'password' => 'password123',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect(User::where('email', 'john@example.com')->exists())->toBeTrue();
});

test('members cannot add a team member directly', function () {
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($member)
        ->post(route('company.business.members.store', ['current_team' => $team->slug]), [
            'name' => 'Jane',
            'email' => 'jane@example.com',
            'password' => 'password123',
        ])
        ->assertForbidden();

    expect(User::where('email', 'jane@example.com')->exists())->toBeFalse();
});

test('a member cannot be added with an existing email', function () {
    $owner = User::factory()->create();
    $existing = User::factory()->create(['email' => 'taken@example.com']);
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($owner)
        ->post(route('company.business.members.store', ['current_team' => $team->slug]), [
            'name' => 'Jane',
            'email' => 'taken@example.com',
            'password' => 'password123',
        ])
        ->assertSessionHasErrors('email');
});

test('team member roles can be updated by owners', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($owner)
        ->patch(route('company.business.members.update', ['current_team' => $team->slug, 'user' => $member]), [
            'role' => TeamRole::Admin->value,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($team->members()->where('user_id', $member->id)->first()->pivot->role->value)->toEqual(TeamRole::Admin->value);
});

test('team member roles can be updated by admins', function () {
    $owner = User::factory()->create();
    $admin = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($admin)
        ->patch(route('company.business.members.update', ['current_team' => $team->slug, 'user' => $member]), [
            'role' => TeamRole::Admin->value,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($team->members()->where('user_id', $member->id)->first()->pivot->role->value)->toEqual(TeamRole::Admin->value);
});

test('admins cannot change the team owner role', function () {
    $owner = User::factory()->create();
    $admin = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);

    $this
        ->actingAs($admin)
        ->patch(route('company.business.members.update', ['current_team' => $team->slug, 'user' => $owner]), [
            'role' => TeamRole::Member->value,
        ])
        ->assertForbidden();

    expect($team->members()->where('user_id', $owner->id)->first()->pivot->role->value)->toEqual(TeamRole::Owner->value);
});

test('team members can be removed by owners', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($owner)
        ->delete(route('company.business.members.destroy', ['current_team' => $team->slug, 'user' => $member]))
        ->assertRedirect();

    expect($member->fresh()->belongsToTeam($team))->toBeFalse();
});

test('team members cannot be removed by non owners', function () {
    $owner = User::factory()->create();
    $admin = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($admin)
        ->delete(route('company.business.members.destroy', ['current_team' => $team->slug, 'user' => $member]))
        ->assertForbidden();
});

test('team owner cannot be removed', function () {
    $owner = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($owner)
        ->delete(route('company.business.members.destroy', ['current_team' => $team->slug, 'user' => $owner]))
        ->assertForbidden();

    expect($owner->fresh()->belongsToTeam($team))->toBeTrue();
});

test('team member role cannot be set to owner', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($owner)
        ->patch(route('company.business.members.update', ['current_team' => $team->slug, 'user' => $member]), [
            'role' => TeamRole::Owner->value,
        ])
        ->assertSessionHasErrors('role');

    expect($team->members()->where('user_id', $member->id)->first()->pivot->role->value)->toEqual(TeamRole::Member->value);
});

test('removed member current team is set to personal team', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $personalTeam = $member->personalTeam();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $member->update(['current_team_id' => $team->id]);

    $this
        ->actingAs($owner)
        ->delete(route('company.business.members.destroy', ['current_team' => $team->slug, 'user' => $member]));

    expect($member->fresh()->current_team_id)->toEqual($personalTeam->id);
});

test('owners can view a member edit page', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($owner)
        ->get(route('company.business.members.edit', ['current_team' => $team->slug, 'user' => $member]))
        ->assertOk();
});

test('plain members cannot view a member edit page', function () {
    $viewer = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($viewer, ['role' => TeamRole::Member->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($viewer)
        ->get(route('company.business.members.edit', ['current_team' => $team->slug, 'user' => $member]))
        ->assertForbidden();
});

test('owners can update a member account and an email change resets verification', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create(['email' => 'old@example.com']);
    $member->forceFill(['email_verified_at' => now()])->save();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($owner)
        ->patch(route('company.business.members.account.update', ['current_team' => $team->slug, 'user' => $member]), [
            'name' => 'Updated Name',
            'email' => 'new@example.com',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $member->refresh();

    expect($member->name)->toEqual('Updated Name');
    expect($member->email)->toEqual('new@example.com');
    expect($member->email_verified_at)->toBeNull();
});

test('admins can update a member account', function () {
    $admin = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($admin)
        ->patch(route('company.business.members.account.update', ['current_team' => $team->slug, 'user' => $member]), [
            'name' => 'Updated Name',
            'email' => 'new@example.com',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($member->fresh()->name)->toEqual('Updated Name');
});

test('admins cannot edit the team owner account', function () {
    $owner = User::factory()->create(['name' => 'Original Owner']);
    $admin = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($admin, ['role' => TeamRole::Admin->value]);

    $this
        ->actingAs($admin)
        ->patch(route('company.business.members.account.update', ['current_team' => $team->slug, 'user' => $owner]), [
            'name' => 'Hijacked',
            'email' => 'hijack@example.com',
        ])
        ->assertForbidden();

    expect($owner->fresh()->name)->toEqual('Original Owner');
});

test('owners can update a member public profile', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($owner)
        ->patch(route('company.business.members.profile.update', ['current_team' => $team->slug, 'user' => $member]), [
            'name' => 'Public Name',
            'job_title' => 'Senior Stylist',
            'description' => 'Ten years of experience.',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($member->profile->name)->toEqual('Public Name');
    expect($member->profile->job_title)->toEqual('Senior Stylist');
});

test('owners can sync a member locations within the team', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $location = Location::factory()->create(['team_id' => $team->id]);

    $this
        ->actingAs($owner)
        ->put(route('company.business.members.locations.update', ['current_team' => $team->slug, 'user' => $member]), [
            'ids' => [$location->id],
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($member->locations()->pluck('locations.id')->all())->toEqual([$location->id]);
});

test('a member cannot be assigned to a location from another team', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $foreignLocation = Location::factory()->create();

    $this
        ->actingAs($owner)
        ->put(route('company.business.members.locations.update', ['current_team' => $team->slug, 'user' => $member]), [
            'ids' => [$foreignLocation->id],
        ])
        ->assertSessionHasErrors('ids.0');

    expect($member->locations()->count())->toBe(0);
});

test('owners can sync a member services within the team', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $category = ServiceCategory::factory()->create(['team_id' => $team->id]);
    $service = Service::factory()->create(['service_category_id' => $category->id]);

    $this
        ->actingAs($owner)
        ->put(route('company.business.members.services.update', ['current_team' => $team->slug, 'user' => $member]), [
            'ids' => [$service->id],
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($member->services()->pluck('services.id')->all())->toEqual([$service->id]);
});

test('a member cannot be assigned to a service from another team', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $foreignService = Service::factory()->create();

    $this
        ->actingAs($owner)
        ->put(route('company.business.members.services.update', ['current_team' => $team->slug, 'user' => $member]), [
            'ids' => [$foreignService->id],
        ])
        ->assertSessionHasErrors('ids.0');

    expect($member->services()->count())->toBe(0);
});

test('syncing member locations only affects the current team assignments', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();
    $otherTeam = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $otherLocation = Location::factory()->create(['team_id' => $otherTeam->id]);
    $member->locations()->attach($otherLocation);

    $teamLocation = Location::factory()->create(['team_id' => $team->id]);

    $this
        ->actingAs($owner)
        ->put(route('company.business.members.locations.update', ['current_team' => $team->slug, 'user' => $member]), [
            'ids' => [$teamLocation->id],
        ])
        ->assertSessionHasNoErrors();

    expect($member->locations()->pluck('locations.id')->sort()->values()->all())
        ->toEqual(collect([$otherLocation->id, $teamLocation->id])->sort()->values()->all());
});

test('a member added directly can be removed without a personal team', function () {
    $owner = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($owner)
        ->post(route('company.business.members.store', ['current_team' => $team->slug]), [
            'name' => 'Jane',
            'email' => 'jane@example.com',
            'password' => 'password123',
        ])
        ->assertSessionHasNoErrors();

    $member = User::where('email', 'jane@example.com')->first();

    expect($member->personalTeam())->toBeNull();
    expect($member->fresh()->current_team_id)->toEqual($team->id);

    $this
        ->actingAs($owner)
        ->delete(route('company.business.members.destroy', ['current_team' => $team->slug, 'user' => $member]))
        ->assertRedirect();

    expect($member->fresh()->belongsToTeam($team))->toBeFalse();
});
