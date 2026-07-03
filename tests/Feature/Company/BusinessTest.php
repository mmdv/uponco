<?php

use App\Enums\BusinessCategory;
use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Build the business route for the given team acting as its current team.
 */
function businessRoute(string $name, Team $team, array $extra = []): string
{
    return route($name, array_merge(['current_team' => $team->slug], $extra));
}

test('the business general page can be rendered', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($user)
        ->get(businessRoute('company.business.edit', $team))
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

    $this
        ->actingAs($user)
        ->get(businessRoute('company.business.members.index', $team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('company/business/members'));
});

test('the team name can be updated by owners', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create(['name' => 'Original Name']);
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($user)
        ->patch(businessRoute('company.business.update', $team), [
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

    $this
        ->actingAs($user)
        ->patch(businessRoute('company.business.update', $team), [
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

    $this
        ->actingAs($user)
        ->patch(businessRoute('company.business.update', $team), [
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
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($member)
        ->patch(businessRoute('company.business.update', $team), [
            'name' => 'Updated Name',
        ])
        ->assertForbidden();
});

test('the team can be deleted by owners', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($user)
        ->delete(businessRoute('company.business.destroy', $team), [
            'name' => $team->name,
        ])
        ->assertRedirect();

    $this->assertSoftDeleted('teams', ['id' => $team->id]);
});

test('team deletion requires name confirmation', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($user)
        ->delete(businessRoute('company.business.destroy', $team), [
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

    $alphaTeam = Team::factory()->create(['name' => 'Alpha Team']);
    $alphaTeam->members()->attach($user, ['role' => TeamRole::Owner->value]);

    // Visiting the team's URL makes it the current team via EnsureTeamMembership.
    $this
        ->actingAs($user)
        ->delete(businessRoute('company.business.destroy', $zuluTeam), [
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
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $member->update(['current_team_id' => $team->id]);

    $this
        ->actingAs($owner)
        ->delete(businessRoute('company.business.destroy', $team), [
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
        ->delete(businessRoute('company.business.destroy', $personalTeam), [
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
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($member)
        ->delete(businessRoute('company.business.destroy', $team), [
            'name' => $team->name,
        ])
        ->assertForbidden();
});

test('the team logo can be uploaded by admins', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($user)
        ->post(businessRoute('company.business.logo.update', $team), [
            'logo' => UploadedFile::fake()->image('logo.png', 200, 200),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $path = $team->fresh()->logo_path;

    expect($path)->not->toBeNull();
    Storage::disk('public')->assertExists($path);
});

test('uploading a new logo removes the previous file', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $this->actingAs($user)
        ->post(businessRoute('company.business.logo.update', $team), [
            'logo' => UploadedFile::fake()->image('first.png'),
        ]);

    $firstPath = $team->fresh()->logo_path;

    $this->actingAs($user)
        ->post(businessRoute('company.business.logo.update', $team), [
            'logo' => UploadedFile::fake()->image('second.png'),
        ]);

    $secondPath = $team->fresh()->logo_path;

    expect($secondPath)->not->toEqual($firstPath);
    Storage::disk('public')->assertMissing($firstPath);
    Storage::disk('public')->assertExists($secondPath);
});

test('an svg logo is accepted', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>';

    $this
        ->actingAs($user)
        ->post(businessRoute('company.business.logo.update', $team), [
            'logo' => UploadedFile::fake()->createWithContent('logo.svg', $svg),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($team->fresh()->logo_path)->not->toBeNull();
});

test('a non image file is rejected as a logo', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($user)
        ->post(businessRoute('company.business.logo.update', $team), [
            'logo' => UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
        ])
        ->assertSessionHasErrors('logo');
});

test('a logo larger than 2MB is rejected', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $this
        ->actingAs($user)
        ->post(businessRoute('company.business.logo.update', $team), [
            'logo' => UploadedFile::fake()->create('logo.png', 3 * 1024, 'image/png'),
        ])
        ->assertSessionHasErrors('logo');
});

test('the team logo cannot be uploaded by members', function () {
    Storage::fake('public');

    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($member)
        ->post(businessRoute('company.business.logo.update', $team), [
            'logo' => UploadedFile::fake()->image('logo.png'),
        ])
        ->assertForbidden();
});

test('the team logo can be removed by admins', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);

    $this->actingAs($user)
        ->post(businessRoute('company.business.logo.update', $team), [
            'logo' => UploadedFile::fake()->image('logo.png'),
        ]);

    $path = $team->fresh()->logo_path;

    $this
        ->actingAs($user)
        ->delete(businessRoute('company.business.logo.destroy', $team))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($team->fresh()->logo_path)->toBeNull();
    Storage::disk('public')->assertMissing($path);
});

test('the team logo cannot be removed by members', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this
        ->actingAs($member)
        ->delete(businessRoute('company.business.logo.destroy', $team))
        ->assertForbidden();
});

test('guests cannot access the business page', function () {
    $team = Team::factory()->create();

    $this->get(businessRoute('company.business.edit', $team))
        ->assertRedirect(route('login'));
});
