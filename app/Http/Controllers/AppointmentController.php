<?php

namespace App\Http\Controllers;

use App\Concerns\InteractsWithAppointmentBooking;
use App\Enums\AppointmentAlert;
use App\Enums\TeamRole;
use App\Http\Requests\Appointments\SaveAppointmentRequest;
use App\Http\Requests\Appointments\StoreDayAppointmentRequest;
use App\Http\Requests\Appointments\UpdateDayAppointmentRequest;
use App\Models\Appointment;
use App\Models\Team;
use App\Support\Appointments\AppointmentOptions;
use App\Support\Appointments\SlotGenerator;
use App\Support\ScheduleSlotMap;
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
                ->booked()
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
            'workingHoursWindow' => Inertia::optional(fn (): array => $this->workingHoursWindow($request, $team)),
        ]);
    }

    /**
     * Each specialist's working windows across a window of days, keyed by `Y-m-d`
     * then user id.
     *
     * Drives the day-view grid columns. The day view fetches a week at a time and
     * caches it client-side, so paging back and forth within the window needs no
     * request. Members only ever see their own column — mirroring the appointments
     * audience.
     *
     * @return array<string, array<int, array<int, array{start: string, end: string}>>>
     */
    protected function workingHoursWindow(Request $request, Team $team): array
    {
        $timezone = $team->timezone ?: config('app.timezone');

        $data = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
            'days' => ['nullable', 'integer', 'min:1', 'max:31'],
        ]);

        $start = CarbonImmutable::parse($data['date'] ?? CarbonImmutable::now($timezone)->format('Y-m-d'));
        $end = $start->addDays(($data['days'] ?? 7) - 1);

        $user = $request->user();
        $onlyUserId = $user->teamRole($team)?->isAtLeast(TeamRole::Admin) ? null : $user->id;

        return ScheduleSlotMap::forTeamBetween($team, $start->format('Y-m-d'), $end->format('Y-m-d'), $onlyUserId);
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
     * Store an appointment created by clicking an empty slot in the day view.
     *
     * The specialist is fixed by the column and the duration is user-chosen, so
     * the slot is validated free-form (must fit the work hours and not overlap a
     * booking) rather than against the picker's generated slots.
     */
    public function dayStore(StoreDayAppointmentRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        $this->persistAppointment($team, $request->appointmentData(), $request->customerData(), $request->service());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Appointment created.')]);

        return back();
    }

    /**
     * Update an appointment edited from the day view.
     *
     * Unlike {@see update()}, the start and duration are free-form (re-validated
     * against the specialist's work hours, ignoring this appointment's own slot),
     * so the time and length can be changed as freely as when quick-creating.
     */
    public function dayUpdate(UpdateDayAppointmentRequest $request, Appointment $appointment): RedirectResponse
    {
        $this->authorizeAppointment($request, $appointment);

        $this->applyDayUpdate($appointment, $request->appointmentData());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Appointment updated.')]);

        return back();
    }

    /**
     * Update the specified appointment.
     */
    public function update(SaveAppointmentRequest $request, Appointment $appointment): RedirectResponse
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
    public function reschedule(Request $request, Appointment $appointment): RedirectResponse
    {
        $this->authorizeAppointment($request, $appointment);

        $data = $request->validate([
            'start_at' => ['required', 'date'],
        ]);

        $team = $request->user()->currentTeam;
        $timezone = $team->timezone ?: config('app.timezone');
        $start = CarbonImmutable::parse($data['start_at'])->utc();

        $available = SlotGenerator::fitsAt(
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
            'end_at' => $start->addMinutes($appointment->service->durationFor($appointment->specialist)),
        ]);

        $this->notifyAppointmentAudience($appointment, AppointmentAlert::Rescheduled);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Appointment rescheduled.')]);

        return back();
    }

    /**
     * Cancel the specified appointment.
     *
     * Appointments are never deleted from the team's schedule; cancelling keeps
     * the row for reporting, frees the slot, and — mirroring the customer's own
     * cancellation flow — emails the customer to let them know.
     */
    public function cancel(Request $request, Appointment $appointment): RedirectResponse
    {
        $this->authorizeAppointment($request, $appointment);

        if ($appointment->isCancelled()) {
            return back();
        }

        $appointment->cancel();
        $this->notifyCustomerCancelled($appointment);
        $this->notifyAppointmentAudience($appointment, AppointmentAlert::Cancelled);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Appointment cancelled.')]);

        return back();
    }

    /**
     * Ensure the user may modify the appointment.
     *
     * The appointment must belong to the user's current team, and members may
     * only touch their own appointments while admins and owners may touch any.
     * Past appointments are read-only for everyone — they can only be previewed.
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

        abort_if($appointment->isPast(), 403, __('Past appointments cannot be changed.'));
    }
}
