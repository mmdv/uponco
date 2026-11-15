<?php

use App\Enums\AppointmentSource;
use App\Enums\AppointmentStatus;
use App\Mcp\Servers\UponcoServer;
use App\Mcp\Tools\BookAppointmentTool;
use App\Mcp\Tools\CancelAppointmentTool;
use App\Mcp\Tools\MarkNoShowTool;
use App\Mcp\Tools\RescheduleAppointmentTool;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Service;
use App\Notifications\Appointments\AppointmentBooked;
use App\Notifications\Appointments\AppointmentCancelled;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

/**
 * Arguments that book the setup's service with its owner at 10:00 on the
 * setup's first day.
 *
 * @param  array<string, mixed>  $setup
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function bookingArguments(array $setup, array $overrides = []): array
{
    return [
        'service_id' => $setup['service']->id,
        'date' => $setup['startAt']->toDateString(),
        'time' => '10:00',
        'customer_name' => 'Aysel Mammadova',
        'customer_email' => 'aysel@example.com',
        ...$overrides,
    ];
}

test('book-appointment books a free slot as an assistant booking and emails the customer', function () {
    Notification::fake();
    $setup = bookableSetup();
    $setup['team']->update(['timezone' => 'Asia/Baku']);

    UponcoServer::actingAs($setup['user'])
        ->tool(BookAppointmentTool::class, bookingArguments($setup, ['time' => '14:00']))
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json
            ->where('booked', true)
            ->where('customer_emailed', true)
            ->where('appointment.booked_by', 'assistant')
            ->etc());

    $appointment = Appointment::sole();
    expect($appointment->source)->toBe(AppointmentSource::Assistant)
        ->and($appointment->specialist_id)->toBe($setup['user']->id)
        // The only location is picked without being named.
        ->and($appointment->location_id)->toBe($setup['location']->id)
        // 14:00 in Baku is 10:00 UTC.
        ->and($appointment->start_at->utc()->format('Y-m-d H:i'))->toBe($setup['startAt']->toDateString().' 10:00')
        ->and($appointment->customer->email)->toBe('aysel@example.com');

    Notification::assertSentOnDemand(AppointmentBooked::class);
});

test('book-appointment links an existing customer by id', function () {
    Notification::fake();
    $setup = bookableSetup();
    $customer = Customer::factory()->for($setup['team'])->create();

    UponcoServer::actingAs($setup['user'])
        ->tool(BookAppointmentTool::class, bookingArguments($setup, ['customer_id' => $customer->id, 'customer_name' => null, 'customer_email' => null]))
        ->assertOk();

    expect(Appointment::sole()->customer_id)->toBe($customer->id)
        ->and($setup['team']->customers()->count())->toBe(1);
});

test('book-appointment applies the calendar\'s validation', function () {
    Notification::fake();
    $setup = bookableSetup();
    mcpAppointment($setup, $setup['user']);
    $otherService = Service::factory()->for($setup['service']->category, 'category')->create(['delivery_type' => 'online']);

    UponcoServer::actingAs($setup['user'])
        ->tool(BookAppointmentTool::class, bookingArguments($setup, ['time' => '09:00']))
        ->assertHasErrors(['The selected time slot is no longer available.']);

    UponcoServer::actingAs($setup['user'])
        ->tool(BookAppointmentTool::class, bookingArguments($setup, ['service_id' => $otherService->id]))
        ->assertHasErrors(['The selected specialist does not provide this service.']);

    expect(Appointment::count())->toBe(1);
    Notification::assertNothingSent();
});

test('reschedule-appointment moves an upcoming appointment to a free time', function () {
    $setup = bookableSetup();
    $appointment = mcpAppointment($setup, $setup['user']);
    $blocker = mcpAppointment($setup, $setup['user'], ['start_at' => $setup['startAt']->addHours(5), 'end_at' => $setup['startAt']->addHours(6)]);

    UponcoServer::actingAs($setup['user'])
        ->tool(RescheduleAppointmentTool::class, ['appointment_id' => $appointment->id, 'date' => $setup['startAt']->toDateString(), 'time' => '14:00'])
        ->assertHasErrors(['That time is not available.']);

    UponcoServer::actingAs($setup['user'])
        ->tool(RescheduleAppointmentTool::class, ['appointment_id' => $appointment->id, 'date' => $setup['startAt']->addDay()->toDateString(), 'time' => '11:00'])
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json->where('rescheduled', true)->etc());

    expect($appointment->refresh()->start_at->utc()->format('Y-m-d H:i'))->toBe($setup['startAt']->addDay()->toDateString().' 11:00')
        ->and($blocker->refresh()->start_at->eq($setup['startAt']->addHours(5)))->toBeTrue();
});

test('reschedule-appointment refuses past appointments', function () {
    $setup = bookableSetup();
    $past = mcpAppointment($setup, $setup['user'], ['start_at' => now()->subDay(), 'end_at' => now()->subDay()->addHour()]);

    UponcoServer::actingAs($setup['user'])
        ->tool(RescheduleAppointmentTool::class, ['appointment_id' => $past->id, 'date' => $setup['startAt']->toDateString(), 'time' => '10:00'])
        ->assertHasErrors(['Only upcoming, booked appointments can be rescheduled.']);
});

test('cancel-appointment cancels and emails the customer', function () {
    Notification::fake();
    $setup = bookableSetup();
    $appointment = mcpAppointment($setup, $setup['user']);

    UponcoServer::actingAs($setup['user'])
        ->tool(CancelAppointmentTool::class, ['appointment_id' => $appointment->id])
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json->where('cancelled', true)->where('appointment.status', 'cancelled')->etc());

    expect($appointment->refresh()->status)->toBe(AppointmentStatus::Cancelled);
    Notification::assertSentOnDemand(AppointmentCancelled::class);

    UponcoServer::actingAs($setup['user'])
        ->tool(CancelAppointmentTool::class, ['appointment_id' => $appointment->id])
        ->assertHasErrors(['This appointment is already cancelled.']);
});

test('a member cannot cancel a colleague\'s appointment', function () {
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);
    $appointment = mcpAppointment($setup, $setup['user']);

    UponcoServer::actingAs($member)
        ->tool(CancelAppointmentTool::class, ['appointment_id' => $appointment->id])
        ->assertHasErrors(['Appointment not found.']);

    expect($appointment->refresh()->status)->toBe(AppointmentStatus::Booked);
});

test('mark-no-show marks and unmarks past appointments only', function () {
    $setup = bookableSetup();
    $past = mcpAppointment($setup, $setup['user'], ['start_at' => now()->subDay(), 'end_at' => now()->subDay()->addHour()]);
    $upcoming = mcpAppointment($setup, $setup['user']);

    UponcoServer::actingAs($setup['user'])
        ->tool(MarkNoShowTool::class, ['appointment_id' => $past->id])
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json->where('status', 'no_show')->etc());

    expect($past->refresh()->status)->toBe(AppointmentStatus::NoShow);

    UponcoServer::actingAs($setup['user'])
        ->tool(MarkNoShowTool::class, ['appointment_id' => $past->id, 'no_show' => false])
        ->assertOk();

    expect($past->refresh()->status)->toBe(AppointmentStatus::Booked);

    UponcoServer::actingAs($setup['user'])
        ->tool(MarkNoShowTool::class, ['appointment_id' => $upcoming->id])
        ->assertHasErrors(['Only past appointments can be marked as a no-show.']);
});

test('changes made through an assistant are logged without customer details', function () {
    Notification::fake();
    Log::spy();
    $setup = bookableSetup();

    UponcoServer::actingAs($setup['user'])
        ->tool(BookAppointmentTool::class, bookingArguments($setup))
        ->assertOk();

    UponcoServer::actingAs($setup['user'])
        ->tool(CancelAppointmentTool::class, ['appointment_id' => 999999])
        ->assertHasErrors();

    Log::shouldHaveReceived('info')->once()->with('MCP write action', Mockery::on(fn (array $context): bool => $context['tool'] === 'book-appointment'
        && $context['user_id'] === $setup['user']->id
        && $context['team_id'] === $setup['team']->id
        && $context['appointment_id'] === Appointment::latest('id')->value('id')
        && ! array_key_exists('customer_email', $context['arguments'])
        && $context['arguments']['service_id'] === $setup['service']->id));
});
