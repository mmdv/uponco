<?php

namespace App\Support\Appointments;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\User;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

/**
 * Generates bookable time slots for a service/location/specialist on a given day.
 *
 * The work hours stored against a specialist are wall-clock times that are
 * interpreted in the team's timezone. Slots are produced in that timezone and
 * exposed as UTC instants so they can be stored and compared consistently.
 * This class is shared between the dashboard and the future public booking page.
 */
class SlotGenerator
{
    /**
     * Build the list of candidate slots for the given day.
     *
     * Each slot is returned as:
     * - start: ISO-8601 UTC instant of the slot start
     * - end: ISO-8601 UTC instant of the slot end (start + service duration)
     * - label: wall-clock start time (HH:MM) in the team timezone
     * - available: whether the slot can be booked (not in the past, not taken/full)
     * - remaining: seats left for a group service, or null for individual services
     *
     * For a group service, multiple customers share the same session (a unique
     * specialist/service/start_at). Same-session bookings count toward capacity
     * without blocking each other; any other overlapping appointment still blocks
     * the slot because the specialist is busy.
     *
     * @return array<int, array{start: string, end: string, label: string, available: bool, remaining: ?int}>
     */
    public static function generate(
        Service $service,
        User $specialist,
        int $teamId,
        string $timezone,
        string $date,
        ?int $ignoreAppointmentId = null,
        ?CarbonImmutable $now = null,
    ): array {
        $timezone = $timezone ?: config('app.timezone');

        $day = CarbonImmutable::createFromFormat('Y-m-d', $date, $timezone)->startOfDay();
        $now ??= CarbonImmutable::now($timezone);

        $dayOfWeek = $day->dayOfWeekIso - 1; // 0 = Monday ... 6 = Sunday

        $workHours = $specialist->workHoursFor($teamId)
            ->where('day_of_week', $dayOfWeek)
            ->orderBy('start_time')
            ->get();

        if ($workHours->isEmpty()) {
            return [];
        }

        $duration = $service->duration;
        $step = $duration + $service->technical_break;

        $booked = static::bookedIntervals($specialist, $day, $ignoreAppointmentId);

        $slots = [];

        foreach ($workHours as $workHour) {
            $intervalStart = static::dateTimeOn($day, (string) $workHour->start_time);
            $intervalEnd = static::dateTimeOn($day, (string) $workHour->end_time);

            $slotStart = $intervalStart;

            while ($slotStart->addMinutes($duration)->lessThanOrEqualTo($intervalEnd)) {
                $slotEnd = $slotStart->addMinutes($duration);
                $slotStartIso = $slotStart->utc()->toIso8601String();

                $isPast = $slotStart->lessThan($now);
                $isBlocked = static::overlapsOther($slotStart, $slotEnd, $slotStartIso, $service, $booked);

                if ($service->isGroup()) {
                    $taken = static::sessionBookings($slotStartIso, $service, $booked);
                    $remaining = max(0, $service->capacity - $taken);
                    $available = ! $isPast && ! $isBlocked && $remaining > 0;
                } else {
                    $remaining = null;
                    $available = ! $isPast && ! $isBlocked;
                }

                $slots[] = [
                    'start' => $slotStartIso,
                    'end' => $slotEnd->utc()->toIso8601String(),
                    'label' => $slotStart->format('H:i'),
                    'available' => $available,
                    'remaining' => $remaining,
                ];

                $slotStart = $slotStart->addMinutes($step);
            }
        }

        return $slots;
    }

    /**
     * Determine whether the given UTC start instant maps to an available slot.
     */
    public static function isAvailableStart(
        Service $service,
        User $specialist,
        int $teamId,
        string $timezone,
        CarbonInterface $startAt,
        ?int $ignoreAppointmentId = null,
        ?CarbonImmutable $now = null,
    ): bool {
        $timezone = $timezone ?: config('app.timezone');
        $date = $startAt->copy()->setTimezone($timezone)->format('Y-m-d');

        $target = CarbonImmutable::parse($startAt)->utc()->toIso8601String();

        foreach (static::generate($service, $specialist, $teamId, $timezone, $date, $ignoreAppointmentId, $now) as $slot) {
            if ($slot['start'] === $target) {
                return $slot['available'];
            }
        }

        return false;
    }

    /**
     * Build a wall-clock datetime on the given day from a stored time string.
     */
    protected static function dateTimeOn(CarbonImmutable $day, string $time): CarbonImmutable
    {
        [$hour, $minute] = explode(':', substr($time, 0, 5));

        return $day->setTime((int) $hour, (int) $minute);
    }

    /**
     * Fetch the specialist's existing appointment intervals overlapping the day.
     *
     * Each interval also carries the booked service and start instant so group
     * sessions (same specialist/service/start_at) can be told apart from other
     * appointments that simply occupy the specialist's time.
     *
     * @return Collection<int, array{start: CarbonInterface, end: CarbonInterface, service_id: int, start_iso: string}>
     */
    protected static function bookedIntervals(User $specialist, CarbonImmutable $day, ?int $ignoreAppointmentId): Collection
    {
        return Appointment::query()
            ->where('specialist_id', $specialist->id)
            ->where('start_at', '<', $day->endOfDay()->utc())
            ->where('end_at', '>', $day->utc())
            ->when($ignoreAppointmentId, fn ($query) => $query->whereKeyNot($ignoreAppointmentId))
            ->get(['start_at', 'end_at', 'service_id'])
            ->map(fn (Appointment $appointment): array => [
                'start' => $appointment->start_at,
                'end' => $appointment->end_at,
                'service_id' => $appointment->service_id,
                'start_iso' => $appointment->start_at->copy()->utc()->toIso8601String(),
            ]);
    }

    /**
     * Determine whether a slot overlaps any booked interval that is not part of
     * the same group session, i.e. an appointment that blocks the specialist.
     *
     * @param  Collection<int, array{start: CarbonInterface, end: CarbonInterface, service_id: int, start_iso: string}>  $booked
     */
    protected static function overlapsOther(
        CarbonImmutable $slotStart,
        CarbonImmutable $slotEnd,
        string $slotStartIso,
        Service $service,
        Collection $booked,
    ): bool {
        foreach ($booked as $interval) {
            if (static::isSameSession($slotStartIso, $service, $interval)) {
                continue;
            }

            if ($slotStart->lessThan($interval['end']) && $slotEnd->greaterThan($interval['start'])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Count how many bookings already belong to this group session.
     *
     * @param  Collection<int, array{start: CarbonInterface, end: CarbonInterface, service_id: int, start_iso: string}>  $booked
     */
    protected static function sessionBookings(string $slotStartIso, Service $service, Collection $booked): int
    {
        return $booked
            ->filter(fn (array $interval): bool => static::isSameSession($slotStartIso, $service, $interval))
            ->count();
    }

    /**
     * Determine whether a booked interval belongs to the same group session as
     * the candidate slot (same group service starting at the same instant).
     *
     * @param  array{start: CarbonInterface, end: CarbonInterface, service_id: int, start_iso: string}  $interval
     */
    protected static function isSameSession(string $slotStartIso, Service $service, array $interval): bool
    {
        return $service->isGroup()
            && $interval['service_id'] === $service->id
            && $interval['start_iso'] === $slotStartIso;
    }
}
