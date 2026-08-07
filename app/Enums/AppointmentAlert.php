<?php

namespace App\Enums;

/**
 * What happened to an appointment from the assigned specialist's point of view.
 * Drives the wording of the push notification they receive on their phone.
 *
 * Kept separate from {@see AppointmentChange}, which describes the same events
 * for the customer's confirmation email and has no cancellation case.
 */
enum AppointmentAlert: string
{
    case Booked = 'booked';
    case Rescheduled = 'rescheduled';
    case Cancelled = 'cancelled';
}
