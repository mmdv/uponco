<?php

use App\Models\Appointment;
use App\Models\Location;
use App\Models\ScheduleSlot;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use App\Support\Appointments\SlotGenerator;
use Carbon\CarbonImmutable;

test('REPRO double POST same slot', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $team->update(['timezone' => 'America/New_York']);
    $category = ServiceCategory::factory()->for($team)->create();
    $service = Service::factory()->for($category, 'category')->create([
        'duration' => 60, 'technical_break' => 0, 'delivery_type' => 'onsite',
        'service_type' => 'individual', 'capacity' => null,
        'online_meeting_provider' => null, 'is_active' => true,
    ]);
    $location = Location::factory()->for($team)->create();
    $service->locations()->attach($location);
    $service->specialists()->attach($user);
    $location->specialists()->attach($user);
    $date = CarbonImmutable::now('America/New_York')->addWeek()->startOfWeek()->format('Y-m-d');
    ScheduleSlot::factory()->for($user)->create(['team_id' => $team->id, 'date' => $date, 'start_time' => '09:00', 'end_time' => '17:00']);
    $slot = collect(SlotGenerator::generate($service, $user, $team->id, $team->timezone, $date))->firstWhere('label', '09:00');

    $payload = [
        'service_id' => $service->id, 'location_id' => $location->id, 'specialist_id' => $user->id,
        'start_at' => $slot['start'], 'customer_name' => 'Jane', 'customer_email' => 'jane@example.com',
    ];

    $this->actingAs($user)
        ->post(route('appointments.store', ['current_team' => $team->slug]), $payload)
        ->assertSessionHasNoErrors();

    $this->actingAs($user)
        ->post(route('appointments.store', ['current_team' => $team->slug]), $payload)
        ->assertSessionHasErrors('start_at');

    expect(Appointment::count())->toBe(1);
});
