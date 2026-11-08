<?php

namespace App\Support\Appointments;

use App\Enums\TeamPermission;
use App\Models\Appointment;
use App\Models\User;

/**
 * Who may see and change an appointment. Shared by the web calendar and the
 * mobile API so both apply exactly the same rules.
 */
class AppointmentAccess
{
    /**
     * The appointment is on the user's current team, and the user either sees
     * every appointment (owners/admins, or the view-all permission) or is its
     * specialist.
     */
    public static function canView(User $user, Appointment $appointment): bool
    {
        $team = $user->currentTeam;

        return $team !== null
            && $appointment->team_id === $team->id
            && ($user->hasTeamPermission($team, TeamPermission::ViewAllAppointments) || $appointment->specialist_id === $user->id);
    }

    /**
     * Ordinary changes (edit, cancel, reschedule) are for upcoming appointments.
     */
    public static function canChangeUpcoming(User $user, Appointment $appointment): bool
    {
        return self::canView($user, $appointment) && ! $appointment->isPast();
    }

    /**
     * Outcome changes (no-show, delete) are for past appointments only.
     */
    public static function canChangePast(User $user, Appointment $appointment): bool
    {
        return self::canView($user, $appointment) && $appointment->isPast();
    }

    /**
     * Abort with 403 unless the user may make this kind of change.
     */
    public static function authorize(User $user, Appointment $appointment, bool $requirePast = false): void
    {
        abort_unless(self::canView($user, $appointment), 403);

        if ($requirePast) {
            abort_unless($appointment->isPast(), 403, __('Only past appointments can be changed this way.'));
        } else {
            abort_if($appointment->isPast(), 403, __('Past appointments cannot be changed.'));
        }
    }
}
