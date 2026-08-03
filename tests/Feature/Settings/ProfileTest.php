<?php

use App\Models\Profile;
use App\Models\User;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->get(route('profile.edit'))
        ->assertOk();
});

test('profile page loads when no profile exists', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->get(route('profile.edit'))
        ->assertInertia(fn ($page) => $page
            ->component('settings/profile')
            ->where('profile.email', null)
        );
});

test('profile information can be created', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Updated Name',
            'email' => 'public@example.com',
            'phone' => '+1 555 000 1111',
            'job_title' => 'Senior Stylist',
            'description' => 'Booking with me is easy.',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $user->refresh();

    expect($user->name)->toBe('Updated Name');
    expect($user->profile)->not->toBeNull();
    expect($user->profile->email)->toBe('public@example.com');
    expect($user->profile->job_title)->toBe('Senior Stylist');
});

test('profile information can be updated', function () {
    $user = User::factory()->create();
    Profile::factory()->for($user)->create(['job_title' => 'Old Title']);

    $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'job_title' => 'New Title',
        ])
        ->assertSessionHasNoErrors();

    expect($user->refresh()->profile->job_title)->toBe('New Title');
    expect(Profile::where('user_id', $user->id)->count())->toBe(1);
});

test('public email is not required', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'job_title' => 'Stylist',
        ])
        ->assertSessionHasNoErrors();

    expect($user->refresh()->profile->email)->toBeNull();
});

test('public email must be valid', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => 'not-an-email',
        ])
        ->assertSessionHasErrors('email');
});

test('name is required', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => '',
        ])
        ->assertSessionHasErrors('name');
});
