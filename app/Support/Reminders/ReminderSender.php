<?php

namespace App\Support\Reminders;

use App\Models\AppointmentReminder;

/**
 * Delivers a scheduled appointment reminder through one channel.
 *
 * Each channel (email today; SMS/WhatsApp later) implements this so the sending
 * job stays channel-agnostic: it resolves the right sender from the reminder's
 * channel via {@see ReminderChannelManager} and calls {@see self::send()}.
 */
interface ReminderSender
{
    /**
     * Send the reminder to the appointment's customer.
     *
     * @throws ReminderNotDeliverable when the customer
     *                                has no address for this channel, so the job can record it as
     *                                skipped rather than failed.
     */
    public function send(AppointmentReminder $reminder): void;
}
