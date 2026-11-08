<?php

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\User;
use App\Notifications\Appointments\AppointmentBooked;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;

test('booking options list services, locations and specialists with their links', function () {
    $setup = bookableSetup();
    Sanctum::actingAs($setup['user']);

    $this->getJson(route('api.v1.calendar.options'))
        ->assertOk()
        ->assertJsonPath('data.timezone', 'UTC')
        ->assertJsonPath('data.services.0.id', $setup['service']->id)
        ->assertJsonPath('data.services.0.location_ids', [$setup['location']->id])
        ->assertJsonPath('data.services.0.specialist_ids', [$setup['user']->id])
        ->assertJsonPath('data.locations.0.id', $setup['location']->id)
        ->assertJsonPath('data.specialists.0.id', $setup['user']->id);
});

test('slots are returned per day for a service and specialist', function () {
    $setup = bookableSetup();
    Sanctum::actingAs($setup['user']);
    $day = $setup['startAt']->format('Y-m-d');

    $response = $this->getJson(route('api.v1.calendar.slots', [
        'service_id' => $setup['service']->id,
        'specialist_id' => $setup['user']->id,
        'date' => $day,
        'days' => 2,
    ]))->assertOk();

    expect(array_keys($response->json('data')))->toBe([$day, $setup['startAt']->addDay()->format('Y-m-d')])
        ->and($response->json("data.{$day}.0.label"))->toBe('09:00')
        ->and($response->json("data.{$day}.0.available"))->toBeTrue();
});

test('another team\'s service gets no slots', function () {
    $setup = bookableSetup();
    $other = bookableSetup();
    Sanctum::actingAs($setup['user']);

    $this->getJson(route('api.v1.calendar.slots', [
        'service_id' => $other['service']->id,
        'specialist_id' => $other['user']->id,
        'date' => $other['startAt']->format('Y-m-d'),
    ]))->assertOk()->assertExactJson(['data' => []]);
});

test('staff can book an appointment and the customer is emailed', function () {
    Notification::fake();
    $setup = bookableSetup();
    Sanctum::actingAs($setup['user']);

    $this->postJson(route('api.v1.calendar.store'), appointmentPayload($setup))
        ->assertCreated()
        ->assertJsonPath('data.service.id', $setup['service']->id)
        ->assertJsonPath('data.customer.name', 'Jane Doe')
        ->assertJsonPath('data.source', 'staff')
        ->assertJsonPath('data.can.edit', true);

    $appointment = Appointment::sole();

    expect($appointment->start_at->equalTo($setup['startAt']))->toBeTrue()
        ->and($appointment->end_at->equalTo($setup['startAt']->addHour()))->toBeTrue();
    Notification::assertSentOnDemand(AppointmentBooked::class);
});

test('a taken slot cannot be booked twice', function () {
    $setup = bookableSetup();
    Sanctum::actingAs($setup['user']);

    $this->postJson(route('api.v1.calendar.store'), appointmentPayload($setup))->assertCreated();

    $this->postJson(route('api.v1.calendar.store'), appointmentPayload($setup, ['customer_email' => 'other@example.com']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['start_at' => __('The selected time slot is no longer available.')]);

    expect(Appointment::count())->toBe(1);
});

test('the web booking rules apply (location, specialist, customer or note)', function () {
    $setup = bookableSetup();
    Sanctum::actingAs($setup['user']);

    $this->postJson(route('api.v1.calendar.store'), appointmentPayload($setup, ['location_id' => null]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['location_id' => __('Select a location for this service.')]);

    $this->postJson(route('api.v1.calendar.store'), appointmentPayload($setup, [
        'customer_name' => null, 'customer_email' => null, 'customer_phone' => null, 'notes' => null,
    ]))->assertUnprocessable()
        ->assertJsonValidationErrors(['customer_name' => __('Add a customer name or a note for the appointment.')]);
});

test('an upcoming appointment can be edited, keeping its own slot free', function () {
    $setup = bookableSetup();
    Sanctum::actingAs($setup['user']);
    $id = $this->postJson(route('api.v1.calendar.store'), appointmentPayload($setup))->json('data.id');

    $this->putJson(route('api.v1.calendar.update', $id), appointmentPayload($setup, ['notes' => 'Bring photos']))
        ->assertOk()
        ->assertJsonPath('data.notes', 'Bring photos');

    $this->putJson(route('api.v1.calendar.update', $id), appointmentPayload($setup, [
        'start_at' => $setup['startAt']->addHours(2)->toIso8601String(),
    ]))->assertOk();

    expect(Appointment::find($id)->start_at->equalTo($setup['startAt']->addHours(2)))->toBeTrue();
});

test('an appointment can be rescheduled to a free time only', function () {
    $setup = bookableSetup();
    Sanctum::actingAs($setup['user']);
    $first = $this->postJson(route('api.v1.calendar.store'), appointmentPayload($setup))->json('data.id');
    $this->postJson(route('api.v1.calendar.store'), appointmentPayload($setup, [
        'start_at' => $setup['startAt']->addHour()->toIso8601String(),
        'customer_email' => 'second@example.com',
    ]))->assertCreated();

    $this->patchJson(route('api.v1.calendar.reschedule', $first), ['start_at' => $setup['startAt']->addHour()->toIso8601String()])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['start_at' => __('That time slot is not available.')]);

    $this->patchJson(route('api.v1.calendar.reschedule', $first), ['start_at' => $setup['startAt']->addHours(3)->toIso8601String()])
        ->assertOk();

    $moved = Appointment::find($first);

    expect($moved->start_at->equalTo($setup['startAt']->addHours(3)))->toBeTrue()
        ->and($moved->end_at->equalTo($setup['startAt']->addHours(4)))->toBeTrue();
});

test('past appointments cannot be edited or rescheduled', function () {
    $setup = bookableSetup();
    $past = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => now()->subDay(),
        'end_at' => now()->subDay()->addHour(),
    ]);
    Sanctum::actingAs($setup['user']);

    $this->putJson(route('api.v1.calendar.update', $past), appointmentPayload($setup))->assertForbidden();
    $this->patchJson(route('api.v1.calendar.reschedule', $past), ['start_at' => $setup['startAt']->toIso8601String()])->assertForbidden();

    expect($past->fresh()->status)->toBe(AppointmentStatus::Booked);
});

test('a member cannot edit a colleague\'s appointment', function () {
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);
    $owners = Appointment::factory()->create([
        'team_id' => $setup['team']->id,
        'service_id' => $setup['service']->id,
        'location_id' => $setup['location']->id,
        'specialist_id' => $setup['user']->id,
        'start_at' => $setup['startAt'],
        'end_at' => $setup['startAt']->addHour(),
    ]);
    Sanctum::actingAs($member);

    $this->putJson(route('api.v1.calendar.update', $owners), appointmentPayload($setup))->assertNotFound();
    $this->patchJson(route('api.v1.calendar.reschedule', $owners), ['start_at' => $setup['startAt']->addHours(2)->toIso8601String()])
        ->assertNotFound();
});

test('booking endpoints require a token', function () {
    $this->getJson(route('api.v1.calendar.options'))->assertUnauthorized();
    $this->postJson(route('api.v1.calendar.store'), [])->assertUnauthorized();
});

test('a user without a team appointment cannot touch it', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->putJson(route('api.v1.calendar.update', 999999), [])->assertNotFound();
});
