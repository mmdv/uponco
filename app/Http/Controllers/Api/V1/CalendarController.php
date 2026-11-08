<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Appointments\CancelAppointment;
use App\Actions\Appointments\RescheduleAppointment;
use App\Actions\Appointments\UpdateAppointmentStatus;
use App\Concerns\InteractsWithAppointmentBooking;
use App\Enums\AppointmentStatus;
use App\Enums\TeamPermission;
use App\Http\Controllers\Controller;
use App\Http\Requests\Appointments\SaveAppointmentRequest;
use App\Models\Appointment;
use App\Models\User;
use App\Support\Appointments\AppointmentAccess;
use App\Support\Appointments\AppointmentOptions;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * The mobile Calendar tab (APPT-1..10): appointments by date range, booking
 * options and free slots, creating/editing/rescheduling, and one appointment
 * with the actions the user may take on it. Same rules as the web calendar:
 * `SaveAppointmentRequest`, `SlotGenerator`, `AppointmentAccess` and the
 * shared booking helpers/actions.
 */
class CalendarController extends Controller
{
    use InteractsWithAppointmentBooking;

    /** The longest range one request may ask for (a month view plus padding). */
    protected const MAX_DAYS = 42;

    protected const RELATIONS = ['service:id,title', 'location:id,name', 'specialist:id,name', 'customer:id,name,email,phone'];

    /**
     * Appointments between two dates (inclusive, team timezone). Like the web
     * calendar it shows bookings and past no-shows, never cancelled ones.
     */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'from' => ['required', 'date_format:Y-m-d'],
            'to' => ['required', 'date_format:Y-m-d', 'after_or_equal:from'],
            'specialist_id' => ['nullable', 'integer'],
        ]);

        $user = $request->user();
        $team = $user->currentTeam;
        $timezone = $team->timezone ?: config('app.timezone');
        $from = CarbonImmutable::parse($data['from'], $timezone)->startOfDay();
        $to = CarbonImmutable::parse($data['to'], $timezone)->endOfDay();

        if ($from->diffInDays($to) >= self::MAX_DAYS) {
            throw ValidationException::withMessages([
                'to' => [__('Ask for at most :days days at a time.', ['days' => self::MAX_DAYS])],
            ]);
        }

        $seesAll = $user->hasTeamPermission($team, TeamPermission::ViewAllAppointments);
        // Members always see only their own; others may narrow to one specialist.
        $specialistId = $seesAll ? ($data['specialist_id'] ?? null) : $user->id;

        $appointments = $team->appointments()
            ->whereIn('status', [AppointmentStatus::Booked, AppointmentStatus::NoShow])
            ->whereBetween('start_at', [$from->utc(), $to->utc()])
            ->when($specialistId, fn ($query) => $query->where('specialist_id', $specialistId))
            ->with(self::RELATIONS)
            ->orderBy('start_at')
            ->get()
            ->map(fn (Appointment $appointment): array => $this->toAppointmentArray($appointment, $timezone))
            ->all();

        return response()->json([
            'data' => [
                'timezone' => $timezone,
                'today' => CarbonImmutable::now($timezone)->toDateString(),
                'sees_all_appointments' => $seesAll,
                'specialists' => $seesAll
                    ? $team->members()->orderBy('name')->get()
                        ->map(fn (User $member): array => ['value' => $member->id, 'label' => $member->name])
                        ->all()
                    : [],
                'appointments' => $appointments,
            ],
        ]);
    }

    /**
     * What the booking form can offer: services, locations and specialists with
     * the links between them and each specialist's next free days (same data
     * the web appointment drawer uses).
     */
    public function options(Request $request): JsonResponse
    {
        $team = $request->user()->currentTeam;

        return response()->json([
            'data' => [
                'timezone' => $team->timezone ?: config('app.timezone'),
                'services' => AppointmentOptions::services($team),
                'locations' => AppointmentOptions::locations($team),
                'specialists' => AppointmentOptions::specialists($team),
            ],
        ]);
    }

    /**
     * Start times for a service with a specialist, for up to 14 days from a
     * date, keyed by day. `appointment_id` frees that appointment's own slot
     * when editing or rescheduling it.
     */
    public function slots(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->availableSlotsWindow($request, $request->user()->currentTeam),
        ]);
    }

    /**
     * Book an appointment from the app (staff booking: the customer is emailed
     * and the team alerted, as on the web).
     */
    public function store(SaveAppointmentRequest $request): JsonResponse
    {
        $appointment = $this->createAppointment($request->user()->currentTeam, $request);

        return response()->json(
            // Reload so database defaults (status, source) are present.
            ['data' => $this->detail($request->user(), $appointment->refresh()->load(self::RELATIONS))],
            Response::HTTP_CREATED,
        );
    }

    /**
     * Edit an upcoming appointment (service, specialist, location, time,
     * customer, notes) with the same validation and notifications as the web.
     */
    public function update(Request $request, int $appointment): JsonResponse
    {
        $model = $this->findVisible($request, $appointment);
        AppointmentAccess::authorize($request->user(), $model);

        // SaveAppointmentRequest reads the appointment from the route (to free
        // its own slot), so bind the model before resolving and validating it.
        $request->route()->setParameter('appointment', $model);
        $saveRequest = app(SaveAppointmentRequest::class);

        $this->updateAppointment($request->user()->currentTeam, $saveRequest, $model);

        return response()->json(['data' => $this->detail($request->user(), $model->refresh()->load(['service', 'location', 'specialist', 'customer']))]);
    }

    /**
     * Move an upcoming appointment to another free start time.
     */
    public function reschedule(Request $request, RescheduleAppointment $rescheduleAppointment, int $appointment): JsonResponse
    {
        $model = $this->findVisible($request, $appointment);
        AppointmentAccess::authorize($request->user(), $model);

        $data = $request->validate(['start_at' => ['required', 'date']]);

        if (! $rescheduleAppointment->handle($model, CarbonImmutable::parse($data['start_at']))) {
            throw ValidationException::withMessages([
                'start_at' => [__('That time slot is not available.')],
            ]);
        }

        return response()->json(['data' => $this->detail($request->user(), $model->refresh()->load(['service', 'location', 'specialist', 'customer']))]);
    }

    /**
     * One appointment, with the extra details and what the user may do with it.
     */
    public function show(Request $request, int $appointment): JsonResponse
    {
        $model = $this->findVisible($request, $appointment);

        return response()->json(['data' => $this->detail($request->user(), $model)]);
    }

    /**
     * Cancel an upcoming appointment (customer is emailed, team alerted).
     */
    public function cancel(Request $request, CancelAppointment $cancelAppointment, int $appointment): JsonResponse
    {
        $model = $this->findVisible($request, $appointment);
        AppointmentAccess::authorize($request->user(), $model);

        $cancelAppointment->handle($model);

        return response()->json(['data' => $this->detail($request->user(), $model->refresh())]);
    }

    /**
     * Mark a past appointment as a no-show, or undo it.
     */
    public function updateStatus(Request $request, UpdateAppointmentStatus $updateStatus, int $appointment): JsonResponse
    {
        $model = $this->findVisible($request, $appointment);
        AppointmentAccess::authorize($request->user(), $model, requirePast: true);

        $status = $request->validate([
            'status' => ['required', Rule::in([AppointmentStatus::Booked->value, AppointmentStatus::NoShow->value])],
        ])['status'];

        $updateStatus->handle($model, AppointmentStatus::from($status));

        return response()->json(['data' => $this->detail($request->user(), $model->refresh())]);
    }

    /**
     * Delete a past appointment (soft delete, no customer email).
     */
    public function destroy(Request $request, int $appointment): Response
    {
        $model = $this->findVisible($request, $appointment);
        AppointmentAccess::authorize($request->user(), $model, requirePast: true);

        $model->delete();

        return response()->noContent();
    }

    /**
     * An appointment the user may see, or 404 (so other teams' and colleagues'
     * appointments are not revealed).
     */
    protected function findVisible(Request $request, int $appointment): Appointment
    {
        // Full related records (not the list's narrow columns): editing and
        // rescheduling read the service's duration and the specialist.
        $model = $request->user()->currentTeam->appointments()
            ->with(['service', 'location', 'specialist', 'customer'])
            ->findOrFail($appointment);

        abort_unless(AppointmentAccess::canView($request->user(), $model), 404);

        return $model;
    }

    /**
     * @return array<string, mixed>
     */
    protected function detail(User $user, Appointment $appointment): array
    {
        $timezone = $user->currentTeam->timezone ?: config('app.timezone');

        return [
            ...$this->toAppointmentArray($appointment, $timezone),
            'delivery_type' => $appointment->delivery_type?->value,
            'client_comment' => $appointment->client_comment,
            'cancelled_at' => $appointment->cancelled_at?->toIso8601String(),
            'can' => [
                'edit' => AppointmentAccess::canChangeUpcoming($user, $appointment) && ! $appointment->isCancelled() && $appointment->specialist_id !== null,
                'cancel' => AppointmentAccess::canChangeUpcoming($user, $appointment) && ! $appointment->isCancelled(),
                'mark_no_show' => AppointmentAccess::canChangePast($user, $appointment) && $appointment->status === AppointmentStatus::Booked,
                'undo_no_show' => AppointmentAccess::canChangePast($user, $appointment) && $appointment->status === AppointmentStatus::NoShow,
                'delete' => AppointmentAccess::canChangePast($user, $appointment),
            ],
        ];
    }
}
