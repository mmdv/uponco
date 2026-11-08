<?php

use App\Enums\AppointmentStatus;
use App\Enums\TeamRole;
use App\Models\Appointment;
use App\Models\Team;
use App\Models\User;
use App\Notifications\Appointments\AppointmentCancelled;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;

/**
 * A Baku team with an owner and a member.
 *
 * @return array{team: Team, owner: User, member: User}
 */
function apiCalendarTeam(): array
{
    $team = Team::factory()->create(['timezone' => 'Asia/Baku']);
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);
    $owner->switchTeam($team);
    $member->switchTeam($team);

    return ['team' => $team, 'owner' => $owner, 'member' => $member];
}

/**
 * @param  array<string, mixed>  $attributes
 */
function apiCalendarAppointment(Team $team, User $specialist, array $attributes = []): Appointment
{
    return Appointment::factory()->create([
        'team_id' => $team->id,
        'specialist_id' => $specialist->id,
        ...$attributes,
    ]);
}

beforeEach(function () {
    $this->travelTo(CarbonImmutable::parse('2026-11-09 12:00', 'Asia/Baku'));
});

test('the calendar requires a token', function () {
    $this->getJson(route('api.v1.calendar.index', ['from' => '2026-11-09', 'to' => '2026-11-15']))->assertUnauthorized();
});

test('owners see the team\'s bookings and no-shows in the range, never cancelled ones', function () {
    ['team' => $team, 'owner' => $owner, 'member' => $member] = apiCalendarTeam();
    $booked = apiCalendarAppointment($team, $member, ['start_at' => CarbonImmutable::parse('2026-11-10 10:00', 'Asia/Baku')->utc()]);
    $noShow = apiCalendarAppointment($team, $owner, ['start_at' => CarbonImmutable::parse('2026-11-09 09:00', 'Asia/Baku')->utc(), 'status' => AppointmentStatus::NoShow]);
    apiCalendarAppointment($team, $owner, ['start_at' => CarbonImmutable::parse('2026-11-11 10:00', 'Asia/Baku')->utc(), 'status' => AppointmentStatus::Cancelled]);
    apiCalendarAppointment($team, $owner, ['start_at' => CarbonImmutable::parse('2026-11-20 10:00', 'Asia/Baku')->utc()]);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.calendar.index', ['from' => '2026-11-09', 'to' => '2026-11-15']))
        ->assertOk()
        ->assertJsonPath('data.today', '2026-11-09')
        ->assertJsonPath('data.timezone', 'Asia/Baku')
        ->assertJsonPath('data.sees_all_appointments', true)
        ->assertJsonCount(2, 'data.specialists')
        ->assertJsonCount(2, 'data.appointments')
        ->assertJsonPath('data.appointments.0.id', $noShow->id)
        ->assertJsonPath('data.appointments.1.id', $booked->id);
});

test('the range is read in the team timezone', function () {
    ['team' => $team, 'owner' => $owner] = apiCalendarTeam();
    // 23:30 Baku on the 15th is 19:30 UTC — inside a range that ends on the 15th.
    $late = apiCalendarAppointment($team, $owner, ['start_at' => CarbonImmutable::parse('2026-11-15 23:30', 'Asia/Baku')->utc()]);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.calendar.index', ['from' => '2026-11-15', 'to' => '2026-11-15']))
        ->assertOk()
        ->assertJsonCount(1, 'data.appointments')
        ->assertJsonPath('data.appointments.0.id', $late->id);
});

test('owners can narrow to one specialist; members only ever see their own', function () {
    ['team' => $team, 'owner' => $owner, 'member' => $member] = apiCalendarTeam();
    $own = apiCalendarAppointment($team, $member, ['start_at' => CarbonImmutable::parse('2026-11-10 10:00', 'Asia/Baku')->utc()]);
    apiCalendarAppointment($team, $owner, ['start_at' => CarbonImmutable::parse('2026-11-10 11:00', 'Asia/Baku')->utc()]);

    Sanctum::actingAs($owner);
    $this->getJson(route('api.v1.calendar.index', ['from' => '2026-11-09', 'to' => '2026-11-15', 'specialist_id' => $member->id]))
        ->assertOk()
        ->assertJsonCount(1, 'data.appointments')
        ->assertJsonPath('data.appointments.0.id', $own->id);

    Sanctum::actingAs($member);
    $this->getJson(route('api.v1.calendar.index', ['from' => '2026-11-09', 'to' => '2026-11-15', 'specialist_id' => $owner->id]))
        ->assertOk()
        ->assertJsonPath('data.sees_all_appointments', false)
        ->assertJsonPath('data.specialists', [])
        ->assertJsonCount(1, 'data.appointments')
        ->assertJsonPath('data.appointments.0.id', $own->id);
});

test('the range must be valid and at most 42 days', function () {
    ['owner' => $owner] = apiCalendarTeam();
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.calendar.index', ['from' => '2026-11-15', 'to' => '2026-11-09']))
        ->assertUnprocessable()->assertJsonValidationErrors(['to']);

    $this->getJson(route('api.v1.calendar.index', ['from' => '2026-11-01', 'to' => '2026-12-31']))
        ->assertUnprocessable()->assertJsonValidationErrors(['to']);
});

test('an upcoming appointment shows what can be done with it', function () {
    ['team' => $team, 'owner' => $owner] = apiCalendarTeam();
    $appointment = apiCalendarAppointment($team, $owner, ['start_at' => now()->addDay(), 'client_comment' => 'Window seat']);
    Sanctum::actingAs($owner);

    $this->getJson(route('api.v1.calendar.show', $appointment))
        ->assertOk()
        ->assertJsonPath('data.id', $appointment->id)
        ->assertJsonPath('data.client_comment', 'Window seat')
        ->assertJsonPath('data.can', ['edit' => true, 'cancel' => true, 'mark_no_show' => false, 'undo_no_show' => false, 'delete' => false]);
});

test('a colleague\'s or another team\'s appointment is not found for a member', function () {
    ['team' => $team, 'owner' => $owner, 'member' => $member] = apiCalendarTeam();
    $colleagues = apiCalendarAppointment($team, $owner, ['start_at' => now()->addDay()]);
    $foreign = Appointment::factory()->create(['start_at' => now()->addDay()]);
    Sanctum::actingAs($member);

    $this->getJson(route('api.v1.calendar.show', $colleagues))->assertNotFound();
    $this->getJson(route('api.v1.calendar.show', $foreign))->assertNotFound();
    $this->patchJson(route('api.v1.calendar.cancel', $colleagues))->assertNotFound();

    expect($colleagues->fresh()->status)->toBe(AppointmentStatus::Booked);
});

test('cancelling an upcoming appointment emails the customer', function () {
    Notification::fake();
    ['team' => $team, 'owner' => $owner] = apiCalendarTeam();
    $appointment = apiCalendarAppointment($team, $owner, ['start_at' => now()->addDay()]);
    Sanctum::actingAs($owner);

    $this->patchJson(route('api.v1.calendar.cancel', $appointment))
        ->assertOk()
        ->assertJsonPath('data.status', 'cancelled')
        ->assertJsonPath('data.can.cancel', false);

    expect($appointment->fresh()->status)->toBe(AppointmentStatus::Cancelled);
    Notification::assertSentOnDemand(AppointmentCancelled::class);
});

test('a past appointment cannot be cancelled', function () {
    ['team' => $team, 'owner' => $owner] = apiCalendarTeam();
    $appointment = apiCalendarAppointment($team, $owner, ['start_at' => now()->subDay(), 'end_at' => now()->subDay()->addHour()]);
    Sanctum::actingAs($owner);

    $this->patchJson(route('api.v1.calendar.cancel', $appointment))->assertForbidden();

    expect($appointment->fresh()->status)->toBe(AppointmentStatus::Booked);
});

test('a past appointment can be marked a no-show and back', function () {
    ['team' => $team, 'owner' => $owner] = apiCalendarTeam();
    $appointment = apiCalendarAppointment($team, $owner, ['start_at' => now()->subDay(), 'end_at' => now()->subDay()->addHour()]);
    Sanctum::actingAs($owner);

    $this->patchJson(route('api.v1.calendar.status', $appointment), ['status' => 'no_show'])
        ->assertOk()
        ->assertJsonPath('data.status', 'no_show')
        ->assertJsonPath('data.can.undo_no_show', true);

    $this->patchJson(route('api.v1.calendar.status', $appointment), ['status' => 'booked'])
        ->assertOk()
        ->assertJsonPath('data.status', 'booked');

    $this->patchJson(route('api.v1.calendar.status', $appointment), ['status' => 'cancelled'])
        ->assertUnprocessable()->assertJsonValidationErrors(['status']);
});

test('only past appointments can be marked no-show or deleted', function () {
    ['team' => $team, 'owner' => $owner] = apiCalendarTeam();
    $upcoming = apiCalendarAppointment($team, $owner, ['start_at' => now()->addDay()]);
    Sanctum::actingAs($owner);

    $this->patchJson(route('api.v1.calendar.status', $upcoming), ['status' => 'no_show'])->assertForbidden();
    $this->deleteJson(route('api.v1.calendar.destroy', $upcoming))->assertForbidden();

    expect($upcoming->fresh())->not->toBeNull();
});

test('a past appointment can be deleted (soft)', function () {
    ['team' => $team, 'owner' => $owner] = apiCalendarTeam();
    $appointment = apiCalendarAppointment($team, $owner, ['start_at' => now()->subDay(), 'end_at' => now()->subDay()->addHour()]);
    Sanctum::actingAs($owner);

    $this->deleteJson(route('api.v1.calendar.destroy', $appointment))->assertNoContent();

    expect(Appointment::find($appointment->id))->toBeNull()
        ->and(Appointment::withTrashed()->find($appointment->id))->not->toBeNull();
});
