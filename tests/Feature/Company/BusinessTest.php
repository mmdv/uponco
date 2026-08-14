<?php

use App\Enums\BusinessCategory;
use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;

/**
 * Build a business route. The acting user's current team is implicit.
 */
function businessRoute(string $name, array $extra = []): string
{
    return route($name, $extra);
}

test('the business general page can be rendered', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    $this
        ->actingAs($user)
        ->get(businessRoute('company.business.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('company/business/general')
            ->where('team.name', $team->name)
        );
});

test('the business members page can be rendered', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    $this
        ->actingAs($user)
        ->get(businessRoute('company.business.members.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('company/business/members'));
});

test('the team name can be updated by owners', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create(['name' => 'Original Name']);
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    $this
        ->actingAs($user)
        ->patch(businessRoute('company.business.update'), [
            'name' => 'Updated Name',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('teams', [
        'id' => $team->id,
        'name' => 'Updated Name',
    ]);
});

test('the timezone and business category can be updated by owners', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    $this
        ->actingAs($user)
        ->patch(businessRoute('company.business.update'), [
            'name' => $team->name,
            'timezone' => 'Europe/London',
            'business_category' => BusinessCategory::Hairdresser->value,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('teams', [
        'id' => $team->id,
        'timezone' => 'Europe/London',
        'business_category' => BusinessCategory::Hairdresser->value,
    ]);
});

test('an invalid timezone or business category is rejected', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    $this
        ->actingAs($user)
        ->patch(businessRoute('company.business.update'), [
            'name' => $team->name,
            'timezone' => 'Not/AZone',
            'business_category' => 'not-a-category',
        ])
        ->assertSessionHasErrors(['timezone', 'business_category']);
});

test('the team name cannot be updated by members', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $owner->switchTeam($team);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($team);

    $this
        ->actingAs($member)
        ->patch(businessRoute('company.business.update'), [
            'name' => 'Updated Name',
        ])
        ->assertForbidden();
});

test('the team can be deleted by owners', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    $this
        ->actingAs($user)
        ->delete(businessRoute('company.business.destroy'), [
            'name' => $team->name,
        ])
        ->assertRedirect();

    $this->assertSoftDeleted('teams', ['id' => $team->id]);
});

test('team deletion requires name confirmation', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    $this
        ->actingAs($user)
        ->delete(businessRoute('company.business.destroy'), [
            'name' => 'Wrong Name',
        ])
        ->assertSessionHasErrors('name');

    $this->assertDatabaseHas('teams', [
        'id' => $team->id,
        'deleted_at' => null,
    ]);
});

test('deleting the current team switches to alphabetically first remaining team', function () {
    $user = User::factory()->create(['name' => 'Mike']);

    $zuluTeam = Team::factory()->create(['name' => 'Zulu Team']);
    $zuluTeam->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($zuluTeam);

    $alphaTeam = Team::factory()->create(['name' => 'Alpha Team']);
    $alphaTeam->members()->attach($user, ['role' => TeamRole::Owner->value]);

    // Deletion always targets whichever team the user currently has selected.
    $user->switchTeam($zuluTeam);

    $this
        ->actingAs($user)
        ->delete(businessRoute('company.business.destroy'), [
            'name' => $zuluTeam->name,
        ])
        ->assertRedirect();

    $this->assertSoftDeleted('teams', ['id' => $zuluTeam->id]);

    expect($user->fresh()->current_team_id)->toEqual($alphaTeam->id);
});

test('deleting team switches other affected users to their personal team', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();

    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $owner->switchTeam($team);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($team);

    $member->update(['current_team_id' => $team->id]);

    $this
        ->actingAs($owner)
        ->delete(businessRoute('company.business.destroy'), [
            'name' => $team->name,
        ])
        ->assertRedirect();

    expect($member->fresh()->current_team_id)->toEqual($member->personalTeam()->id);
});

test('personal teams cannot be deleted', function () {
    $user = User::factory()->create();
    $personalTeam = $user->personalTeam();

    $this
        ->actingAs($user)
        ->delete(businessRoute('company.business.destroy'), [
            'name' => $personalTeam->name,
        ])
        ->assertForbidden();

    $this->assertDatabaseHas('teams', [
        'id' => $personalTeam->id,
        'deleted_at' => null,
    ]);
});

test('the team cannot be deleted by non owners', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $owner->switchTeam($team);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($team);

    $this
        ->actingAs($member)
        ->delete(businessRoute('company.business.destroy'), [
            'name' => $team->name,
        ])
        ->assertForbidden();
});

test('guests cannot access the business page', function () {
    $team = Team::factory()->create();

    $this->get(businessRoute('company.business.edit'))
        ->assertRedirect(route('login'));
});
