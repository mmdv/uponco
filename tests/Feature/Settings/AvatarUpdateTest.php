<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('a user can upload a profile picture', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->post(route('account.avatar.update'), [
            'avatar' => UploadedFile::fake()->image('me.png', 200, 200),
        ])
        ->assertRedirect(route('account.edit'))
        ->assertSessionHasNoErrors();

    $path = $user->fresh()->avatar_path;

    expect($path)->not->toBeNull();
    Storage::disk('public')->assertExists($path);
});

test('the avatar url is exposed on the serialized user', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('account.avatar.update'), [
            'avatar' => UploadedFile::fake()->image('me.png'),
        ]);

    expect($user->fresh()->avatar)->toContain('/storage/avatars/');
});

test('uploading a new profile picture removes the previous file', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('account.avatar.update'), [
            'avatar' => UploadedFile::fake()->image('first.png'),
        ]);

    $firstPath = $user->fresh()->avatar_path;

    $this->actingAs($user)
        ->post(route('account.avatar.update'), [
            'avatar' => UploadedFile::fake()->image('second.png'),
        ]);

    $secondPath = $user->fresh()->avatar_path;

    expect($secondPath)->not->toEqual($firstPath);
    Storage::disk('public')->assertMissing($firstPath);
    Storage::disk('public')->assertExists($secondPath);
});

test('an svg profile picture is accepted', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>';

    $this
        ->actingAs($user)
        ->post(route('account.avatar.update'), [
            'avatar' => UploadedFile::fake()->createWithContent('me.svg', $svg),
        ])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->avatar_path)->not->toBeNull();
});

test('a non image file is rejected as a profile picture', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->post(route('account.avatar.update'), [
            'avatar' => UploadedFile::fake()->create('resume.pdf', 100, 'application/pdf'),
        ])
        ->assertSessionHasErrors('avatar');
});

test('a profile picture larger than 2MB is rejected', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->post(route('account.avatar.update'), [
            'avatar' => UploadedFile::fake()->create('big.png', 3 * 1024, 'image/png'),
        ])
        ->assertSessionHasErrors('avatar');
});

test('a user can remove their profile picture', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('account.avatar.update'), [
            'avatar' => UploadedFile::fake()->image('me.png'),
        ]);

    $path = $user->fresh()->avatar_path;

    $this
        ->actingAs($user)
        ->delete(route('account.avatar.destroy'))
        ->assertRedirect(route('account.edit'))
        ->assertSessionHasNoErrors();

    expect($user->fresh()->avatar_path)->toBeNull();
    Storage::disk('public')->assertMissing($path);
});

test('guests cannot upload a profile picture', function () {
    $this
        ->post(route('account.avatar.update'), [
            'avatar' => UploadedFile::fake()->image('me.png'),
        ])
        ->assertRedirect(route('login'));
});
