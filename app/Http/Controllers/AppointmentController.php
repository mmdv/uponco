<?php

namespace App\Http\Controllers;

use App\Concerns\InteractsWithAppointmentBooking;
use App\Enums\TeamRole;
use App\Http\Requests\Appointments\SaveAppointmentRequest;
use App\Models\Appointment;
use App\Support\Appointments\AppointmentOptions;
use App\Support\Appointments\SlotGenerator;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    use InteractsWithAppointmentBooking;

    /**
     * Display a listing of the team's appointments.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $user->currentTeam;
        $timezone = $team->timezone ?: config('app.timezone');

        return Inertia::render('appointments/index', [
            'timezone' => $timezone,
            'appointments' => $team->appointments()
                ->with(['service:id,title', 'location:id,name', 'specialist:id,name', 'customer:id,name,email,phone'])
                // Admins and owners see the whole team's schedule; members only see their own.
                ->unless($user->teamRole($team)?->isAtLeast(TeamRole::Admin), fn ($query) => $query->where('specialist_id', $user->id))
                ->orderBy('start_at')
                ->get()
                ->map(fn (Appointment $appointment): array => $this->toAppointmentArray($appointment, $timezone)),
            'services' => fn (): array => AppointmentOptions::services($team),
            'locations' => fn (): array => AppointmentOptions::locations($team),
            'specialists' => fn (): array => AppointmentOptions::specialists($team),
            'availableSlots' => Inertia::optional(fn (): array => $this->availableSlots($request, $team)),
        ]);
    }

    /**
     * Store a newly created appointment.
     */
    public function store(SaveAppointmentRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        $this->createAppointment($team, $request);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Appointment created.')]);

        return back();
    }

    /**
     * Update the specified appointment.
     */
    public function update(SaveAppointmentRequest $request, string $current_team, Appointment $appointment): RedirectResponse
    {
        $this->authorizeAppointment($request, $appointment);

        $team = $request->user()->currentTeam;

        $this->updateAppointment($team, $request, $appointment);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Appointment updated.')]);

        return back();
    }

    /**
     * Move an existing appointment to a new start time (drag-and-drop).
     *
     * The slot is re-validated against the specialist's work hours and existing
     * bookings so the appointment can never land on an unavailable time, even if
     * the client allowed the drop.
     */
    public function reschedule(Request $request, string $current_team, Appointment $appointment): RedirectResponse
    {
        $this->authorizeAppointment($request, $appointment);

        $data = $request->validate([
            'start_at' => ['required', 'date'],
        ]);

        $team = $request->user()->currentTeam;
        $timezone = $team->timezone ?: config('app.timezone');
        $start = CarbonImmutable::parse($data['start_at'])->utc();

        $available = SlotGenerator::isAvailableStart(
            $appointment->service,
            $appointment->specialist,
            $team->id,
            $timezone,
            $start,
            $appointment->id,
        );

        if (! $available) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('That time slot is not available.')]);

            return back();
        }

        $appointment->update([
            'start_at' => $start,
            'end_at' => $start->addMinutes($appointment->service->duration),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Appointment rescheduled.')]);

        return back();
    }

    /**
     * Delete the specified appointment.
     */
    public function destroy(Request $request, string $current_team, Appointment $appointment): RedirectResponse
    {
        $this->authorizeAppointment($request, $appointment);

        $appointment->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Appointment deleted.')]);

        return back();
    }

    /**
     * Ensure the user may act on the appointment.
     *
     * The appointment must belong to the user's current team, and members may
     * only touch their own appointments while admins and owners may touch any.
     */
    protected function authorizeAppointment(Request $request, Appointment $appointment): void
    {
        $user = $request->user();
        $team = $user->currentTeam;

        abort_unless($appointment->team_id === $team->id, 403);

        abort_unless(
            $user->teamRole($team)?->isAtLeast(TeamRole::Admin) || $appointment->specialist_id === $user->id,
            403,
        );
    }
}
