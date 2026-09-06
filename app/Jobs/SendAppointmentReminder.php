<?php

namespace App\Jobs;

use App\Enums\ReminderStatus;
use App\Models\AppointmentReminder;
use App\Support\Reminders\ReminderChannelManager;
use App\Support\Reminders\ReminderNotDeliverable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Fires a scheduled appointment reminder at its send time.
 *
 * Dispatched with a delay when the booking is made, so it runs when the reminder
 * is due. Because that can be days later, everything is re-checked at fire time:
 * the reminder is skipped if the appointment was cancelled or has already
 * started, deferred (re-dispatched) if the appointment was moved later, and only
 * then sent through the channel the reminder recorded.
 */
class SendAppointmentReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(public AppointmentReminder $reminder) {}

    /**
     * Execute the job.
     */
    public function handle(ReminderChannelManager $channels): void
    {
        $reminder = $this->reminder->fresh('appointment');

        // Already sent, cancelled or otherwise settled by another pass.
        if ($reminder === null || $reminder->status !== ReminderStatus::Pending) {
            return;
        }

        $appointment = $reminder->appointment;

        if ($appointment === null || $appointment->isCancelled()) {
            $reminder->update(['status' => ReminderStatus::Cancelled]);

            return;
        }

        // The appointment already started (or was moved into the past): a
        // reminder now would be useless, so drop it.
        if ($appointment->start_at->isPast()) {
            $reminder->update(['status' => ReminderStatus::Skipped]);

            return;
        }

        // The appointment was rescheduled to a later time, so the reminder is
        // early: reset its send time and leave it pending. The scheduler poll
        // picks it up again once the new send time arrives — we never re-arm it
        // with a queue delay, since SQS caps that at 15 minutes.
        $target = $appointment->start_at->copy()->subMinutes($reminder->offset_minutes);

        if ($target->isFuture()) {
            $reminder->update(['send_at' => $target]);

            return;
        }

        if (! $channels->supports($reminder->channel)) {
            $reminder->update(['status' => ReminderStatus::Skipped]);

            return;
        }

        try {
            $channels->for($reminder->channel)->send($reminder);

            $reminder->update([
                'status' => ReminderStatus::Sent,
                'sent_at' => now(),
            ]);
        } catch (ReminderNotDeliverable) {
            // The customer can't be reached on this channel (e.g. no email):
            // an expected outcome, not a failure to retry.
            $reminder->update(['status' => ReminderStatus::Skipped]);
        } catch (\Throwable $e) {
            report($e);
            $reminder->update(['status' => ReminderStatus::Failed]);
        }
    }
}
