<?php

namespace App\Actions\Appointments;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;

class UpdateAppointmentStatus
{
    /**
     * Mark a past appointment as a no-show, or undo that (back to booked). No
     * customer email is sent. Returns false when the status was already set.
     */
    public function handle(Appointment $appointment, AppointmentStatus $status): bool
    {
        if ($appointment->status === $status) {
            return false;
        }

        if ($status === AppointmentStatus::NoShow) {
            $appointment->markNoShow();
        } else {
            $appointment->markBooked();
        }

        return true;
    }
}
