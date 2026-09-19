<?php

namespace App\Http\Controllers;

use App\Concerns\InteractsWithAppointmentBooking;
use App\Enums\AppointmentAlert;
use App\Enums\AppointmentStatus;
use App\Enums\TeamPermission;
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
use Illuminate\Validation\Rule;
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
                // Show live bookings and past no-shows (so staff can see/undo the
                // mark); cancelled appointments stay hidden from the schedule.
                ->whereIn('status', [AppointmentStatus::Booked, AppointmentStatus::NoShow])
                ->with(['service:id,title', 'location:id,name', 'specialist:id,name', 'customer:id,name,email,phone'])
                // Members with the view-all-appointments permission (admins and owners
                // have it by role) see the whole team's schedule; others only see their own.
                ->unless($user->hasTeamPermission($team, TeamPermission::ViewAllAppointments), fn ($query) => $query->where('specialist_id', $user->id))
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
        $onlyUserId = $user->hasTeamPermission($team, TeamPermission::ViewAllAppointments) ? null : $user->id;

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
     * Update the outcome status of a past appointment (no-show / attended).
     *
     * A no-show marks that the customer did not attend; setting it back to booked
     * undoes the mark. Only past appointments can be marked, and — unlike a
     * cancellation — the customer is not emailed (they did not come). Idempotent.
     */
    public function updateStatus(Request $request, Appointment $appointment): RedirectResponse
    {
        $this->authorizeAppointment($request, $appointment, requirePast: true);

        $status = $request->validate([
            'status' => ['required', Rule::enum(AppointmentStatus::class), Rule::in([
                AppointmentStatus::Booked->value,
                AppointmentStatus::NoShow->value,
            ])],
        ])['status'];

        $target = AppointmentStatus::from($status);

        if ($appointment->status === $target) {
            return back();
        }

        if ($target === AppointmentStatus::NoShow) {
            $appointment->markNoShow();
            $message = __('Marked as no-show.');
        } else {
            $appointment->markBooked();
            $message = __('Marked as attended.');
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return back();
    }

    /**
     * Delete a past appointment.
     *
     * For phoned-in cancellations or accidental entries. The appointment is
     * soft-deleted (recoverable), stays out of the schedule, and — being past —
     * sends no customer notification.
     */
    public function destroy(Request $request, Appointment $appointment): RedirectResponse
    {
        $this->authorizeAppointment($request, $appointment, requirePast: true);

        $appointment->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Appointment deleted.')]);

        return back();
    }

    /**
     * Ensure the user may modify the appointment.
     *
     * The appointment must belong to the user's current team, and members may
     * only touch their own appointments while admins and owners may touch any.
     *
     * Time gating flips with the action: ordinary edits are future-only (past
     * appointments are read-only), while past-only actions (no-show, delete)
     * pass `requirePast: true` to require a past appointment instead.
     */
    protected function authorizeAppointment(Request $request, Appointment $appointment, bool $requirePast = false): void
    {
        $user = $request->user();
        $team = $user->currentTeam;

        abort_unless($appointment->team_id === $team->id, 403);

        abort_unless(
            $user->hasTeamPermission($team, TeamPermission::ViewAllAppointments) || $appointment->specialist_id === $user->id,
            403,
        );

        if ($requirePast) {
            abort_unless($appointment->isPast(), 403, __('Only past appointments can be changed this way.'));
        } else {
            abort_if($appointment->isPast(), 403, __('Past appointments cannot be changed.'));
        }
    }
}
