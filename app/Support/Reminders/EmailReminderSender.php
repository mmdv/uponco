<?php

namespace App\Support\Reminders;

use App\Models\AppointmentReminder;
use App\Notifications\Appointments\AppointmentReminderNotification;
use Illuminate\Support\Facades\Notification;

/**
 * Sends an appointment reminder by email, reusing the branded appointment mail.
 */
class EmailReminderSender implements ReminderSender
{
    /**
     * Send the reminder email to the appointment's customer.
     */
    public function send(AppointmentReminder $reminder): void
    {
        $appointment = $reminder->appointment;
        $email = $appointment->customer?->email;

        if (blank($email)) {
            throw new ReminderNotDeliverable('The customer has no email address.');
        }

        Notification::route('mail', $email)
            ->notify(new AppointmentReminderNotification($appointment, $reminder->offset()));
    }
}
