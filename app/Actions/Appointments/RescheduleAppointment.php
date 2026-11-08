<?php

namespace App\Actions\Appointments;

use App\Concerns\InteractsWithAppointmentBooking;
use App\Enums\AppointmentAlert;
use App\Models\Appointment;
use App\Support\Appointments\SlotGenerator;
use Carbon\CarbonInterface;

class RescheduleAppointment
{
    use InteractsWithAppointmentBooking;

    /**
     * Move an appointment to a new start, keeping its service, specialist and
     * duration. The slot is re-checked against the specialist's working hours
     * and other bookings (ignoring this appointment), so it can never land on
     * an unavailable time. Returns false when the time is not available.
     * Shared by the web calendar (drag-and-drop) and the mobile API.
     */
    public function handle(Appointment $appointment, CarbonInterface $start): bool
    {
        $team = $appointment->team;
        $start = $start->toImmutable()->utc();

        $available = SlotGenerator::fitsAt(
            $appointment->service,
            $appointment->specialist,
            $team->id,
            $team->timezone ?: config('app.timezone'),
            $start,
            $appointment->id,
        );

        if (! $available) {
            return false;
        }

        $appointment->update([
            'start_at' => $start,
            'end_at' => $start->addMinutes($appointment->service->durationFor($appointment->specialist)),
        ]);

        $this->notifyAppointmentAudience($appointment, AppointmentAlert::Rescheduled);

        return true;
    }
}
