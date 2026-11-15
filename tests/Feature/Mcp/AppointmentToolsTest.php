<?php

use App\Mcp\Servers\UponcoServer;
use App\Mcp\Tools\GetAppointmentTool;
use App\Mcp\Tools\ListAppointmentsTool;
use App\Models\Appointment;
use App\Models\User;

test('business tools relay the account blocker instead of returning data', function () {
    $user = User::factory()->unverified()->create();

    UponcoServer::actingAs($user)
        ->tool(ListAppointmentsTool::class, ['from' => '2026-11-15'])
        ->assertHasErrors(['Verify your email address in Uponco first, then try again.']);
});

test('list-appointments returns the day\'s appointments in the business timezone', function () {
    $setup = bookableSetup();
    $setup['team']->update(['timezone' => 'Asia/Baku']);
    $appointment = mcpAppointment($setup, $setup['user']); // 09:00 UTC = 13:00 in Baku
    mcpAppointment($setup, $setup['user'], ['start_at' => $setup['startAt']->addDay(), 'end_at' => $setup['startAt']->addDay()->addHour()]);
    mcpAppointment($setup, $setup['user'], ['start_at' => $setup['startAt']->addHours(2), 'end_at' => $setup['startAt']->addHours(3)])->update(['status' => 'cancelled']);

    UponcoServer::actingAs($setup['user'])
        ->tool(ListAppointmentsTool::class, ['from' => $setup['startAt']->toDateString()])
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json
            ->where('count', 1)
            ->where('only_your_appointments', false)
            ->where('appointments.0.id', $appointment->id)
            ->where('appointments.0.start', $setup['startAt']->setTimezone('Asia/Baku')->toIso8601String())
            ->where('appointments.0.customer.name', 'Aysel Mammadova')
            ->etc());
});

test('list-appointments can include cancelled ones and filter by customer', function () {
    $setup = bookableSetup();
    $cancelled = mcpAppointment($setup, $setup['user'], ['status' => 'cancelled']);
    mcpAppointment($setup, $setup['user'], ['start_at' => $setup['startAt']->addHours(2), 'end_at' => $setup['startAt']->addHours(3)]);

    UponcoServer::actingAs($setup['user'])
        ->tool(ListAppointmentsTool::class, [
            'from' => $setup['startAt']->toDateString(),
            'customer_id' => $cancelled->customer_id,
            'include_cancelled' => true,
        ])
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json
            ->where('count', 1)
            ->where('appointments.0.status', 'cancelled')
            ->etc());
});

test('list-appointments shows a member only their own appointments', function () {
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);
    $own = mcpAppointment($setup, $member);
    mcpAppointment($setup, $setup['user']);

    UponcoServer::actingAs($member)
        ->tool(ListAppointmentsTool::class, ['from' => $setup['startAt']->toDateString()])
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json
            ->where('only_your_appointments', true)
            ->where('count', 1)
            ->where('appointments.0.id', $own->id)
            ->etc());

    UponcoServer::actingAs($member)
        ->tool(ListAppointmentsTool::class, ['from' => $setup['startAt']->toDateString(), 'specialist_id' => $setup['user']->id])
        ->assertHasErrors(['You can only see your own appointments.']);
});

test('list-appointments refuses ranges longer than 42 days', function () {
    $setup = bookableSetup();

    UponcoServer::actingAs($setup['user'])
        ->tool(ListAppointmentsTool::class, ['from' => '2026-01-01', 'to' => '2026-03-01'])
        ->assertHasErrors(['Ask for at most 42 days at a time.']);
});

test('get-appointment returns the details and what the user may do', function () {
    $setup = bookableSetup();
    $upcoming = mcpAppointment($setup, $setup['user']);
    $past = mcpAppointment($setup, $setup['user'], ['start_at' => now()->subDay(), 'end_at' => now()->subDay()->addHour()]);

    UponcoServer::actingAs($setup['user'])
        ->tool(GetAppointmentTool::class, ['appointment_id' => $upcoming->id])
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json
            ->where('id', $upcoming->id)
            ->where('can', ['reschedule' => true, 'cancel' => true, 'mark_no_show' => false, 'undo_no_show' => false])
            ->etc());

    UponcoServer::actingAs($setup['user'])
        ->tool(GetAppointmentTool::class, ['appointment_id' => $past->id])
        ->assertOk()
        ->assertStructuredContent(fn ($json) => $json
            ->where('can', ['reschedule' => false, 'cancel' => false, 'mark_no_show' => true, 'undo_no_show' => false])
            ->etc());
});

test('get-appointment hides colleagues\' and other businesses\' appointments', function () {
    $setup = bookableSetup();
    $member = teamMemberSpecialist($setup);
    $colleagues = mcpAppointment($setup, $setup['user']);
    $otherBusiness = Appointment::factory()->create();

    foreach ([$colleagues, $otherBusiness] as $appointment) {
        UponcoServer::actingAs($member)
            ->tool(GetAppointmentTool::class, ['appointment_id' => $appointment->id])
            ->assertHasErrors(['Appointment not found.']);
    }
});
