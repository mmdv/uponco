<?php

namespace App\Http\Requests\Appointments;

use App\Models\Appointment;

/**
 * Validates a free-form edit of an existing appointment from the day view:
 * identical to {@see StoreDayAppointmentRequest}, but the appointment being
 * edited is excluded from the overlap check so it never conflicts with itself.
 *
 * Authorization is enforced in the controller via `authorizeAppointment()`,
 * consistent with the other appointment mutations.
 */
class UpdateDayAppointmentRequest extends StoreDayAppointmentRequest
{
    /**
     * The appointment being edited never counts as overlapping itself.
     */
    protected function ignoreAppointmentId(): ?int
    {
        $appointment = $this->route('appointment');

        return $appointment instanceof Appointment ? $appointment->id : null;
    }
}
