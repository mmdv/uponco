<?php

use App\Enums\TeamRole;
use App\Models\Location;
use App\Models\ScheduleSlot;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

/**
 * Build a fully related service/location/specialist scenario with work hours,
 * and return the pieces plus a valid future start instant.
 *
 * Lives here rather than in a test file so every suite that books an
 * appointment — appointments, public booking, notifications — can be run on its
 * own instead of only as part of a larger run.
 *
 * @param  array<string, mixed>  $serviceOverrides
 * @return array<string, mixed>
 */
function bookableSetup(array $serviceOverrides = []): array
{
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $team->update(['timezone' => 'UTC']);

    $category = ServiceCategory::factory()->for($team)->create();
    $service = Service::factory()->for($category, 'category')->create(array_merge([
        'duration' => 60,
        'technical_break' => 0,
        'service_type' => 'individual',
        'capacity' => null,
        'delivery_type' => 'onsite',
        'online_meeting_provider' => null,
        'is_active' => true,
    ], $serviceOverrides));

    $location = Location::factory()->for($team)->create();

    $service->locations()->attach($location);
    $service->specialists()->attach($user);
    $location->specialists()->attach($user);

    $startAt = CarbonImmutable::now('UTC')->addWeek()->startOfWeek()->setTime(9, 0);

    // Schedule is now date-based, so seed a concrete slot for every day of the
    // booking week (tests book on $startAt and $startAt->addDay()).
    foreach (range(0, 6) as $offset) {
        ScheduleSlot::factory()->for($user)->create([
            'team_id' => $team->id,
            'date' => $startAt->addDays($offset)->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);
    }

    return compact('user', 'team', 'service', 'location', 'startAt');
}

/**
 * Add a second bookable specialist to the setup's team: attached to the same
 * service and location, and working the same hours.
 *
 * @param  array<string, mixed>  $setup
 */
function teamMemberSpecialist(array $setup): User
{
    $member = User::factory()->create();
    $setup['team']->members()->attach($member, ['role' => TeamRole::Member->value]);
    $member->switchTeam($setup['team']);

    $setup['service']->specialists()->attach($member);
    $setup['location']->specialists()->attach($member);

    foreach (range(0, 6) as $offset) {
        ScheduleSlot::factory()->for($member)->create([
            'team_id' => $setup['team']->id,
            'date' => $setup['startAt']->addDays($offset)->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);
    }

    return $member;
}

/**
 * A valid booking payload for the setup, ready to post.
 *
 * @param  array<string, mixed>  $setup
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function appointmentPayload(array $setup, array $overrides = []): array
{
    return array_merge([
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']?->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt']->toIso8601String(),
        'customer_name' => 'Jane Doe',
        'customer_email' => 'jane@example.com',
        'customer_phone' => '+1 555 123 4567',
        'notes' => 'First visit',
    ], $overrides);
}
