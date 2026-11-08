<?php

namespace App\Actions\Appointments;

use App\Concerns\InteractsWithAppointmentBooking;
use App\Enums\AppointmentAlert;
use App\Models\Appointment;

class CancelAppointment
{
    use InteractsWithAppointmentBooking;

    /**
     * Cancel an appointment: keep the row for reporting, free the slot, email
     * the customer and alert the team (same as the web calendar). Returns
     * false when it was already cancelled.
     */
    public function handle(Appointment $appointment): bool
    {
        if ($appointment->isCancelled()) {
            return false;
        }

        $appointment->cancel();
        $this->notifyCustomerCancelled($appointment);
        $this->notifyAppointmentAudience($appointment, AppointmentAlert::Cancelled);

        return true;
    }
}
