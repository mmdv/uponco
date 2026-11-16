<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

test('the booking profile can be read and updated', function () {
    $user = User::factory()->create(['name' => 'Old Name']);
    Sanctum::actingAs($user);

    $this->getJson(route('api.v1.me.profile'))->assertOk()->assertJsonPath('data.name', 'Old Name');

    $this->patchJson(route('api.v1.me.profile'), [
        'name' => 'Mia Chen', 'phone' => '+994500000000', 'job_title' => 'Colourist', 'email' => 'not-an-email',
    ])->assertJsonValidationErrors('email');

    $this->patchJson(route('api.v1.me.profile'), ['name' => 'Mia Chen', 'job_title' => 'Colourist'])
        ->assertOk()
        ->assertJsonPath('data.name', 'Mia Chen')
        ->assertJsonPath('data.job_title', 'Colourist');
});

test('a square photo can be uploaded and removed', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->postJson(route('api.v1.me.avatar.update'), ['avatar' => UploadedFile::fake()->image('wide.png', 300, 200)])
        ->assertJsonValidationErrors('avatar');

    $this->postJson(route('api.v1.me.avatar.update'), ['avatar' => UploadedFile::fake()->image('me.png', 200, 200)])
        ->assertOk()
        ->assertJsonPath('data.id', $user->id);

    $path = $user->fresh()->avatar_path;
    Storage::disk('public')->assertExists($path);

    $this->deleteJson(route('api.v1.me.avatar.destroy'))->assertOk()->assertJsonPath('data.avatar', null);
    Storage::disk('public')->assertMissing($path);
});

test('changing the login email needs the current password and re-verification', function () {
    $user = User::factory()->create(['password' => 'password']);
    Sanctum::actingAs($user);

    $this->patchJson(route('api.v1.me.email.update'), ['email' => 'new@example.com', 'current_password' => 'wrong'])
        ->assertJsonValidationErrors('current_password');

    $this->patchJson(route('api.v1.me.email.update'), ['email' => 'new@example.com', 'current_password' => 'password'])
        ->assertOk()
        ->assertJsonPath('data.email', 'new@example.com')
        ->assertJsonPath('data.email_verified', false);
});

test('the password changes only with the current one', function () {
    $user = User::factory()->create(['password' => 'password']);
    Sanctum::actingAs($user);

    $this->putJson(route('api.v1.me.password.update'), [
        'current_password' => 'wrong', 'password' => 'new-password-123', 'password_confirmation' => 'new-password-123',
    ])->assertJsonValidationErrors('current_password');

    $this->putJson(route('api.v1.me.password.update'), [
        'current_password' => 'password', 'password' => 'new-password-123', 'password_confirmation' => 'new-password-123',
    ])->assertNoContent();

    expect(Hash::check('new-password-123', $user->fresh()->password))->toBeTrue();
});

test('deleting the account removes it, its tokens and the teams it owned alone', function () {
    $user = User::factory()->create(['password' => 'password']);
    $solo = Team::factory()->create(['name' => 'Solo Studio']);
    $solo->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $user->createToken('phone');
    Sanctum::actingAs($user);

    $this->getJson(route('api.v1.me.deletion'))
        ->assertOk()
        ->assertJsonPath('data.requires_password', true)
        ->assertJsonFragment(['name' => 'Solo Studio']);

    $this->deleteJson(route('api.v1.me.destroy'), ['password' => 'wrong'])->assertJsonValidationErrors('password');

    $this->deleteJson(route('api.v1.me.destroy'), ['password' => 'password'])->assertNoContent();

    expect(User::find($user->id))->toBeNull()
        ->and(Team::withTrashed()->find($solo->id))->toBeNull()
        ->and(DB::table('personal_access_tokens')->where('tokenable_id', $user->id)->exists())->toBeFalse();
});

test('an owner of a shared team must hand it over before deleting the account', function () {
    $user = User::factory()->create(['password' => 'password']);
    $team = Team::factory()->create(['name' => 'Shared Studio']);
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $team->members()->attach(User::factory()->create(), ['role' => TeamRole::Member->value]);
    Sanctum::actingAs($user);

    $this->deleteJson(route('api.v1.me.destroy'), ['password' => 'password'])->assertJsonValidationErrors('teams');

    expect(User::find($user->id))->not->toBeNull();
});

test('an account without a password deletes without one', function () {
    $user = User::factory()->create(['password' => null]);
    Sanctum::actingAs($user);

    $this->getJson(route('api.v1.me.deletion'))->assertJsonPath('data.requires_password', false);
    $this->deleteJson(route('api.v1.me.destroy'))->assertNoContent();

    expect(User::find($user->id))->toBeNull();
});

test('the Google connection shows and can be disconnected', function () {
    $user = User::factory()->create([
        'google_account_email' => 'me@gmail.com',
        'google_access_token' => 'token',
        'google_refresh_token' => 'refresh',
    ]);
    Sanctum::actingAs($user);

    $this->getJson(route('api.v1.me.integrations'))
        ->assertOk()
        ->assertJsonPath('data.google', ['connected' => true, 'email' => 'me@gmail.com'])
        ->assertJsonPath('data.connect_url', route('integrations.edit'));

    $this->deleteJson(route('api.v1.me.integrations.google.destroy'))->assertNoContent();

    expect($user->fresh()->hasGoogleConnected())->toBeFalse();
});

test('unverified accounts cannot change email or password or delete via the API', function () {
    Sanctum::actingAs(User::factory()->unverified()->create());

    $this->putJson(route('api.v1.me.password.update'), [])->assertForbidden();
    $this->deleteJson(route('api.v1.me.destroy'))->assertForbidden();
});

test('account endpoints require a token', function () {
    $this->getJson(route('api.v1.me.profile'))->assertUnauthorized();
    $this->deleteJson(route('api.v1.me.destroy'))->assertUnauthorized();
});
