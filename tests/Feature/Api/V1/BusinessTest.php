<?php

use App\Enums\BusinessCategory;
use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

/**
 * A team and one person in it with the given role.
 *
 * @return array{0: Team, 1: User}
 */
function apiBusinessTeam(TeamRole $role = TeamRole::Owner): array
{
    $user = User::factory()->create();
    $team = Team::factory()->create(['name' => 'Studio One', 'slug' => 'studio-one']);
    $team->members()->attach($user, ['role' => $role->value]);
    $user->switchTeam($team);

    return [$team, $user];
}

test('the business shows its details and the form choices', function () {
    [, $owner] = apiBusinessTeam();
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.business.show'))
        ->assertOk()
        ->assertJsonPath('data.name', 'Studio One')
        ->assertJsonPath('data.booking_url', route('public.appointments.show', ['company' => 'studio-one']))
        ->assertJsonPath('data.options.default_color', '#0063ff')
        ->assertJsonPath('data.options.categories.0.value', BusinessCategory::options()[0]['value']);
});

test('an admin updates the name, address, timezone and category', function () {
    [$team, $admin] = apiBusinessTeam(TeamRole::Admin);
    Sanctum::actingAs($admin);

    $this->patchJson(route('api.v1.business.update'), [
        'name' => 'Studio Two',
        'slug' => 'Studio Two!',
        'timezone' => 'Asia/Baku',
        'business_category' => BusinessCategory::Other->value,
        'business_category_other' => 'Tattoo',
    ])->assertOk()
        ->assertJsonPath('data.name', 'Studio Two')
        ->assertJsonPath('data.slug', 'studio-two')
        ->assertJsonPath('data.timezone', 'Asia/Baku')
        ->assertJsonPath('data.business_category_other', 'Tattoo');

    expect($team->fresh()->slug)->toBe('studio-two');
});

test('a taken address or an unknown timezone is rejected', function () {
    Team::factory()->create(['slug' => 'taken']);
    [, $owner] = apiBusinessTeam();
    Sanctum::actingAs($owner);

    $this->patchJson(route('api.v1.business.update'), ['name' => 'Studio', 'slug' => 'taken', 'timezone' => 'Mars/Base'])
        ->assertJsonValidationErrors(['slug', 'timezone']);
});

test('the brand colour is saved normalised and can be reset', function () {
    [$team, $owner] = apiBusinessTeam();
    Sanctum::actingAs($owner);

    $this->patchJson(route('api.v1.business.brand.update'), ['brand_primary_color' => 'red'])
        ->assertJsonValidationErrors('brand_primary_color');

    $this->patchJson(route('api.v1.business.brand.update'), ['brand_primary_color' => '#DB2777'])
        ->assertOk()
        ->assertJsonPath('data.brand_color', '#db2777');

    $this->patchJson(route('api.v1.business.brand.update'), ['brand_primary_color' => null])
        ->assertOk()
        ->assertJsonPath('data.brand_color', null);
});

test('a logo can be uploaded and removed', function () {
    Storage::fake('public');
    [$team, $owner] = apiBusinessTeam();
    Sanctum::actingAs($owner);

    $this->postJson(route('api.v1.business.logo.update'), ['logo' => UploadedFile::fake()->create('logo.gif', 10, 'image/gif')])
        ->assertJsonValidationErrors('logo');

    $this->postJson(route('api.v1.business.logo.update'), ['logo' => UploadedFile::fake()->image('logo.png', 400, 120)])
        ->assertOk();

    $path = $team->fresh()->logo_path;
    Storage::disk('public')->assertExists($path);

    $this->deleteJson(route('api.v1.business.logo.destroy'))->assertOk()->assertJsonPath('data.logo_url', null);
    Storage::disk('public')->assertMissing($path);
});

test('plain members cannot change the business', function () {
    [, $member] = apiBusinessTeam(TeamRole::Member);
    Sanctum::actingAs($member);

    $this->getJson(route('api.v1.business.show'))->assertForbidden();
    $this->patchJson(route('api.v1.business.update'), ['name' => 'Mine now'])->assertForbidden();
    $this->patchJson(route('api.v1.business.brand.update'), ['brand_primary_color' => '#000000'])->assertForbidden();
});

test('business endpoints require a token', function () {
    $this->getJson(route('api.v1.business.show'))->assertUnauthorized();
});
