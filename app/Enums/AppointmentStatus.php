<?php

namespace App\Enums;

/**
 * The lifecycle state of an appointment.
 *
 * Cancelled appointments are kept in the database rather than deleted so they
 * can still be counted for reporting, but they no longer occupy a slot or count
 * towards any booking total. A no-show is a past appointment the customer did
 * not attend; like a cancellation it stops occupying the slot and counting, but
 * it is recorded on purpose so no-show rates can be reported.
 */
enum AppointmentStatus: string
{
    case Booked = 'booked';
    case Cancelled = 'cancelled';
    case NoShow = 'no_show';

    /**
     * Get the human-readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Booked => __('Booked'),
            self::Cancelled => __('Cancelled'),
            self::NoShow => __('No-show'),
        };
    }
}
