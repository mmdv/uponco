<?php

use App\Enums\ReminderChannel;
use App\Enums\ReminderOffset;
use App\Enums\ReminderStatus;
use App\Jobs\SendAppointmentReminder;
use App\Models\Appointment;
use App\Models\AppointmentReminder;
use App\Models\Customer;
use App\Notifications\Appointments\AppointmentReminderNotification;
use App\Support\Reminders\ReminderChannelManager;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Notification;

/**
 * Book through the public store route with the given overrides applied.
 */
function bookWith(array $setup, array $overrides = [])
{
    return test()->post(
        route('public.appointments.store', ['company' => $setup['team']->slug]),
        appointmentPayload($setup, $overrides),
    );
}

test('booking with a reminder choice schedules an email reminder', function () {
    Bus::fake();
    $setup = bookableSetup();

    bookWith($setup, ['reminder_offset_minutes' => ReminderOffset::TwentyOneHours->value])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $reminder = AppointmentReminder::sole();

    expect($reminder->channel)->toBe(ReminderChannel::Email)
        ->and($reminder->status)->toBe(ReminderStatus::Pending)
        ->and($reminder->offset_minutes)->toBe(1260)
        ->and($reminder->send_at->equalTo($setup['startAt']->subMinutes(1260)))->toBeTrue();

    Bus::assertDispatched(
        SendAppointmentReminder::class,
        fn (SendAppointmentReminder $job): bool => $job->reminder->is($reminder),
    );
});

test('booking without a reminder choice schedules nothing', function () {
    Bus::fake();
    $setup = bookableSetup();

    bookWith($setup, ['reminder_offset_minutes' => null])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect(AppointmentReminder::count())->toBe(0);
    Bus::assertNotDispatched(SendAppointmentReminder::class);
});

test('a phone-only booking schedules no email reminder', function () {
    Bus::fake();
    $setup = bookableSetup();

    bookWith($setup, [
        'customer_email' => null,
        'customer_phone' => '+1 555 987 6543',
        'reminder_offset_minutes' => ReminderOffset::TwentyOneHours->value,
    ])->assertSessionHasNoErrors()->assertRedirect();

    expect(AppointmentReminder::count())->toBe(0);
    Bus::assertNotDispatched(SendAppointmentReminder::class);
});

test('an unknown reminder offset is rejected', function () {
    $setup = bookableSetup();

    bookWith($setup, ['reminder_offset_minutes' => 999])
        ->assertSessionHasErrors('reminder_offset_minutes');

    expect(AppointmentReminder::count())->toBe(0);
});

/**
 * A future, booked appointment whose customer has an email address, with a
 * reminder already due.
 */
function dueReminder(array $overrides = []): AppointmentReminder
{
    $appointment = Appointment::factory()->create(array_merge([
        'customer_id' => Customer::factory()->create(['email' => 'jane@example.com']),
        'start_at' => now()->addHours(21),
        'end_at' => now()->addHours(22),
    ], $overrides));

    return AppointmentReminder::factory()->due()->create([
        'appointment_id' => $appointment->id,
    ]);
}

test('the job sends a due reminder and marks it sent', function () {
    Notification::fake();
    $reminder = dueReminder();

    (new SendAppointmentReminder($reminder))->handle(app(ReminderChannelManager::class));

    Notification::assertSentOnDemand(AppointmentReminderNotification::class);
    expect($reminder->fresh()->status)->toBe(ReminderStatus::Sent)
        ->and($reminder->fresh()->sent_at)->not->toBeNull();
});

test('the job cancels a reminder for a cancelled appointment', function () {
    Notification::fake();
    $reminder = dueReminder();
    $reminder->appointment->cancel();

    (new SendAppointmentReminder($reminder->fresh()))->handle(app(ReminderChannelManager::class));

    Notification::assertNothingSent();
    expect($reminder->fresh()->status)->toBe(ReminderStatus::Cancelled);
});

test('the job skips a reminder for an appointment already started', function () {
    Notification::fake();
    $reminder = dueReminder(['start_at' => now()->subMinute(), 'end_at' => now()->addMinutes(59)]);

    (new SendAppointmentReminder($reminder))->handle(app(ReminderChannelManager::class));

    Notification::assertNothingSent();
    expect($reminder->fresh()->status)->toBe(ReminderStatus::Skipped);
});

test('the job re-arms a reminder when the appointment moved later', function () {
    Bus::fake();
    Notification::fake();

    // The appointment is now far enough out that the 21-hour lead time is still
    // in the future, so the due reminder is early and must be deferred.
    $reminder = dueReminder(['start_at' => now()->addDays(3), 'end_at' => now()->addDays(3)->addHour()]);

    (new SendAppointmentReminder($reminder))->handle(app(ReminderChannelManager::class));

    Notification::assertNothingSent();
    expect($reminder->fresh()->status)->toBe(ReminderStatus::Pending);
    Bus::assertDispatched(SendAppointmentReminder::class);
});

test('cancelling an appointment cancels its pending reminders', function () {
    $reminder = dueReminder();

    $reminder->appointment->cancel();

    expect($reminder->fresh()->status)->toBe(ReminderStatus::Cancelled);
});
