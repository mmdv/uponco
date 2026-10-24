<?php

use App\Models\ScheduleSlot;
use App\Models\Team;
use App\Models\User;
use Database\Seeders\HomeShowcaseSeeder;
use Database\Seeders\StudioNorthSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    Storage::fake('public');
});

it('seeds a bookable v2 demo barbershop that re-seeds cleanly', function () {
    $this->seed(StudioNorthSeeder::class);
    $this->seed(StudioNorthSeeder::class);

    $team = Team::where('slug', StudioNorthSeeder::TEAM_SLUG)->sole();

    expect($team->members()->count())->toBe(3)
        ->and($team->services()->count())->toBe(5)
        ->and($team->locations()->count())->toBe(1)
        ->and(User::where('email', 'like', '%@studio-north.test')->count())->toBe(3)
        ->and(ScheduleSlot::where('team_id', $team->id)->whereDate('date', '>=', today())->exists())->toBeTrue();

    Storage::disk('public')->assertExists($team->logo_path);

    $this->get(route('public.appointments.show', $team->slug))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/appointments/book-v2')
            ->has('specialists', 3)
            ->has('services', 5));
});

it('gives the demo accounts an unguessable password outside local', function () {
    app()->detectEnvironment(fn () => 'production');

    app(StudioNorthSeeder::class)->run();

    $owner = User::where('email', StudioNorthSeeder::OWNER_EMAIL)->sole();

    expect(Hash::check('password', $owner->password))->toBeFalse();
});

it('refuses to seed the showcase bookings outside local', function () {
    app()->detectEnvironment(fn () => 'production');

    app(HomeShowcaseSeeder::class)->run();

    expect(Team::where('slug', HomeShowcaseSeeder::YOGA_SLUG)->exists())->toBeFalse();
});

it('fills the showcase group class so it shows three places left', function () {
    $this->seed(HomeShowcaseSeeder::class);

    $yoga = Team::where('slug', HomeShowcaseSeeder::YOGA_SLUG)->sole();
    $class = $yoga->services()->where('title', 'Morning flow')->sole();

    expect($yoga->appointments()->where('service_id', $class->id)->count())->toBe(5)
        ->and($class->capacity)->toBe(8)
        ->and(StudioNorthSeeder::team()->appointments()->count())->toBe(9);
});
