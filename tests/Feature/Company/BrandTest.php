<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use App\Support\BrandPalette;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Build a brand route. The acting user's current team is implicit.
 */
function brandRoute(string $name, array $extra = []): string
{
    return route($name, $extra);
}

/**
 * An owner on a fresh team, switched into it.
 *
 * @return array{0: User, 1: Team}
 */
function brandOwner(): array
{
    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    return [$user, $team];
}

test('the brand page can be rendered', function () {
    [$user, $team] = brandOwner();

    $team->update(['brand_primary_color' => '#ff6600']);

    $this
        ->actingAs($user)
        ->get(brandRoute('company.brand.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('company/brand/index')
            ->where('team.brandPrimaryColor', '#ff6600')
            ->where('palette.primary', '#ff6600')
            ->where('palette.accent', 'rgba(255, 102, 0, 0.1)')
            ->where('defaultPrimaryColor', BrandPalette::DEFAULT_PRIMARY)
        );
});

test('the brand page falls back to the default colour when none is set', function () {
    [$user] = brandOwner();

    $this
        ->actingAs($user)
        ->get(brandRoute('company.brand.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('team.brandPrimaryColor', null)
            ->where('palette.primary', BrandPalette::DEFAULT_PRIMARY)
        );
});

test('an admin can save a primary colour', function () {
    [$user, $team] = brandOwner();

    $this
        ->actingAs($user)
        ->patch(brandRoute('company.brand.update'), [
            'brand_primary_color' => '#FF6600',
        ])
        ->assertRedirect(route('company.brand.index'))
        ->assertSessionHasNoErrors();

    expect($team->fresh()->brand_primary_color)->toBe('#ff6600');
});

test('clearing the primary colour puts the team back on the default', function () {
    [$user, $team] = brandOwner();

    $team->update(['brand_primary_color' => '#ff6600']);

    $this
        ->actingAs($user)
        ->patch(brandRoute('company.brand.update'), [
            'brand_primary_color' => '',
        ])
        ->assertRedirect(route('company.brand.index'));

    $team->refresh();

    expect($team->brand_primary_color)->toBeNull();
    expect($team->brandPrimaryColor())->toBe(BrandPalette::DEFAULT_PRIMARY);
});

test('an invalid primary colour is rejected', function () {
    [$user, $team] = brandOwner();

    $this
        ->actingAs($user)
        ->patch(brandRoute('company.brand.update'), [
            'brand_primary_color' => 'not-a-colour',
        ])
        ->assertSessionHasErrors('brand_primary_color');

    expect($team->fresh()->brand_primary_color)->toBeNull();
});

test('a member cannot save a primary colour', function () {
    [$owner, $team] = brandOwner();

    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($team);

    $this
        ->actingAs($member)
        ->patch(brandRoute('company.brand.update'), [
            'brand_primary_color' => '#ff6600',
        ])
        ->assertForbidden();

    expect($team->fresh()->brand_primary_color)->toBeNull();
});

test('the team logo can be uploaded by admins', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    $this
        ->actingAs($user)
        ->post(brandRoute('company.brand.logo.update'), [
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
    $user->switchTeam($team);

    $this->actingAs($user)
        ->post(brandRoute('company.brand.logo.update'), [
            'logo' => UploadedFile::fake()->image('first.png'),
        ]);

    $firstPath = $team->fresh()->logo_path;

    $this->actingAs($user)
        ->post(brandRoute('company.brand.logo.update'), [
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
    $user->switchTeam($team);

    $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>';

    $this
        ->actingAs($user)
        ->post(brandRoute('company.brand.logo.update'), [
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
    $user->switchTeam($team);

    $this
        ->actingAs($user)
        ->post(brandRoute('company.brand.logo.update'), [
            'logo' => UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
        ])
        ->assertSessionHasErrors('logo');
});

test('a logo larger than 2MB is rejected', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    $this
        ->actingAs($user)
        ->post(brandRoute('company.brand.logo.update'), [
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
    $owner->switchTeam($team);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($team);

    $this
        ->actingAs($member)
        ->post(brandRoute('company.brand.logo.update'), [
            'logo' => UploadedFile::fake()->image('logo.png'),
        ])
        ->assertForbidden();
});

test('the team logo can be removed by admins', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->switchTeam($team);

    $this->actingAs($user)
        ->post(brandRoute('company.brand.logo.update'), [
            'logo' => UploadedFile::fake()->image('logo.png'),
        ]);

    $path = $team->fresh()->logo_path;

    $this
        ->actingAs($user)
        ->delete(brandRoute('company.brand.logo.destroy'))
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
    $owner->switchTeam($team);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($team);

    $this
        ->actingAs($member)
        ->delete(brandRoute('company.brand.logo.destroy'))
        ->assertForbidden();
});
