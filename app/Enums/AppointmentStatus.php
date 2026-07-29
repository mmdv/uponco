<?php

namespace App\Enums;

/**
 * The lifecycle state of an appointment.
 *
 * Cancelled appointments are kept in the database rather than deleted so they
 * can still be counted for reporting, but they no longer occupy a slot or count
 * towards any booking total.
 */
enum AppointmentStatus: string
{
    case Booked = 'booked';
    case Cancelled = 'cancelled';

    /**
     * Get the human-readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Booked => __('Booked'),
            self::Cancelled => __('Cancelled'),
        };
    }
}
