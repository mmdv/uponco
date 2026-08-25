<?php

use App\Enums\TeamRole;
use App\Models\Appointment;
use App\Models\Location;
use App\Models\ScheduleSlot;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * A specialist may work for more than one company. The public booking page is
 * unauthenticated and iframe-embeddable, so nothing about company A may be
 * inferable from company B's page — neither A's booked times (which would let a
 * competitor reconstruct A's calendar by diffing free against busy) nor A's
 * internal service and location ids.
 *
 * @return array{setup: array<string, mixed>, other: array<string, mixed>}
 */
function sharedSpecialistAcrossTeams(): array
{
    $setup = bookableSetup();
    $specialist = $setup['user'];

    // A second, unrelated company that employs the same person.
    $otherOwner = User::factory()->create();
    $otherTeam = $otherOwner->currentTeam;
    $otherTeam->update(['timezone' => 'UTC']);

    $otherTeam->members()->attach($specialist, ['role' => TeamRole::Member->value]);

    $otherCategory = ServiceCategory::factory()->for($otherTeam)->create();
    $otherService = Service::factory()->for($otherCategory, 'category')->create([
        'duration' => 60,
        'technical_break' => 0,
        'service_type' => 'individual',
        'capacity' => null,
        'delivery_type' => 'onsite',
        'online_meeting_provider' => null,
        'is_active' => true,
    ]);
    $otherLocation = Location::factory()->for($otherTeam)->create();

    $otherService->locations()->attach($otherLocation);
    $otherService->specialists()->attach($specialist);
    $otherLocation->specialists()->attach($specialist);

    foreach (range(0, 6) as $offset) {
        ScheduleSlot::factory()->for($specialist)->create([
            'team_id' => $otherTeam->id,
            'date' => $setup['startAt']->addDays($offset)->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);
    }

    return [
        'setup' => $setup,
        'other' => [
            'team' => $otherTeam,
            'service' => $otherService,
            'location' => $otherLocation,
        ],
    ];
}

test("a booking in one team does not blank the slot on another team's public page", function () {
    ['setup' => $setup, 'other' => $other] = sharedSpecialistAcrossTeams();

    $start = $setup['startAt'];
    $day = $start->format('Y-m-d');

    // The specialist is booked solid for an hour — but for the OTHER company.
    Appointment::factory()->create([
        'team_id' => $other['team']->id,
        'service_id' => $other['service']->id,
        'location_id' => $other['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $start,
        'end_at' => $start->addHour(),
    ]);

    $slots = fetchSlotWindow($setup)->assertOk()->json("props.slotWindow.{$day}");

    expect($slots)->not->toBeNull();

    // 09:00 is the slot the other team's appointment occupies. It must still be
    // offered as available here; a busy flag would disclose that booking. The
    // slot is always present in the payload, so `available` is the assertion
    // that means anything.
    expect(collect($slots)->firstWhere('label', '09:00')['available'])->toBeTrue();
});

test('a booking in the same team does still blank the slot', function () {
    $setup = bookableSetup();
    $start = $setup['startAt'];

    Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $start,
        'end_at' => $start->addHour(),
    ]);

    $day = $start->format('Y-m-d');

    $slots = fetchSlotWindow($setup)->assertOk()->json("props.slotWindow.{$day}");

    // The control for the test above: a booking on this team's own books does
    // mark the slot busy, so that assertion is measuring team scoping and not
    // a slot that was never blanked in the first place.
    expect(collect($slots)->firstWhere('label', '09:00')['available'])->toBeFalse();
});

test("the public page never lists another team's service or location ids", function () {
    ['setup' => $setup, 'other' => $other] = sharedSpecialistAcrossTeams();

    $this->get(route('public.appointments.show', ['company' => $setup['team']->slug]))
        ->assertInertia(function (Assert $page) use ($setup, $other) {
            $specialist = collect($page->toArray()['props']['specialists'])
                ->firstWhere('id', $setup['user']->id);

            expect($specialist)->not->toBeNull()
                ->and($specialist['service_ids'])->toContain($setup['service']->id)
                ->and($specialist['service_ids'])->not->toContain($other['service']->id)
                ->and($specialist['location_ids'])->toContain($setup['location']->id)
                ->and($specialist['location_ids'])->not->toContain($other['location']->id);
        });
});
