<?php

namespace App\Enums;

/**
 * The lifecycle state of a scheduled appointment reminder.
 *
 * A reminder is created as {@see self::Pending} and settles into exactly one
 * terminal state: it was delivered ({@see self::Sent}), it was deliberately not
 * sent because the appointment moved out from under it ({@see self::Skipped} for
 * a past appointment, {@see self::Cancelled} for a cancelled one), or delivery
 * threw ({@see self::Failed}).
 */
enum ReminderStatus: string
{
    case Pending = 'pending';
    case Sent = 'sent';
    case Skipped = 'skipped';
    case Failed = 'failed';
    case Cancelled = 'cancelled';
}
