<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Appointments\CancelAppointment;
use App\Actions\Appointments\UpdateAppointmentStatus;
use App\Concerns\InteractsWithAppointmentBooking;
use App\Enums\AppointmentStatus;
use App\Enums\TeamPermission;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use App\Support\Appointments\AppointmentAccess;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * The mobile Calendar tab (APPT-1, 2, 7..10): appointments by date range and
 * one appointment with the actions the user may take on it. Same visibility
 * and rules as the web calendar (`AppointmentAccess`, shared actions).
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
        $model = $request->user()->currentTeam->appointments()->with(self::RELATIONS)->findOrFail($appointment);

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
                'cancel' => AppointmentAccess::canChangeUpcoming($user, $appointment) && ! $appointment->isCancelled(),
                'mark_no_show' => AppointmentAccess::canChangePast($user, $appointment) && $appointment->status === AppointmentStatus::Booked,
                'undo_no_show' => AppointmentAccess::canChangePast($user, $appointment) && $appointment->status === AppointmentStatus::NoShow,
                'delete' => AppointmentAccess::canChangePast($user, $appointment),
            ],
        ];
    }
}
