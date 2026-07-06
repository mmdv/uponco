<?php

namespace App\Support\Appointments;

use App\Models\Appointment;
use App\Models\Location;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use App\Models\WorkHour;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

/**
 * Builds the service/location/specialist option data needed to drive the
 * appointment booking picker. Each entity carries the ids of the related
 * entities so the client can narrow the available choices without extra
 * round trips. Shared between the dashboard and the future public page.
 */
class AppointmentOptions
{
    /**
     * Get the bookable services for the team, including their category and relationships.
     *
     * @return array<int, array{id: int, title: string, description: ?string, duration: int, price_type: string, price: ?string, price_min: ?string, price_max: ?string, delivery_type: string, service_type: string, capacity: ?int, category_id: int, category_name: string, location_ids: array<int, int>, specialist_ids: array<int, int>}>
     */
    public static function services(Team $team): array
    {
        return $team->services()
            ->where('services.is_active', true)
            ->with(['category:id,name', 'locations:id', 'specialists:id'])
            ->orderBy('title')
            ->get()
            ->map(fn (Service $service): array => [
                'id' => $service->id,
                'title' => $service->title,
                'description' => $service->description,
                'duration' => $service->duration,
                'price_type' => $service->price_type->value,
                'price' => $service->price,
                'price_min' => $service->price_min,
                'price_max' => $service->price_max,
                'delivery_type' => $service->delivery_type->value,
                'service_type' => $service->service_type->value,
                'capacity' => $service->capacity,
                'category_id' => $service->service_category_id,
                'category_name' => $service->category->name,
                'location_ids' => $service->locations->pluck('id')->all(),
                'specialist_ids' => $service->specialists->pluck('id')->all(),
            ])
            ->all();
    }

    /**
     * Get the team's locations, including their service and specialist relationships.
     *
     * @return array<int, array{id: int, name: string, service_ids: array<int, int>, specialist_ids: array<int, int>}>
     */
    public static function locations(Team $team): array
    {
        return $team->locations()
            ->where('is_active', true)
            ->with(['services:id', 'specialists:id'])
            ->orderBy('name')
            ->get()
            ->map(fn (Location $location): array => [
                'id' => $location->id,
                'name' => $location->name,
                'service_ids' => $location->services->pluck('id')->all(),
                'specialist_ids' => $location->specialists->pluck('id')->all(),
            ])
            ->all();
    }

    /**
     * Get the team's specialists, including their service and location relationships.
     *
     * @return array<int, array{id: int, name: string, avatar: ?string, service_ids: array<int, int>, location_ids: array<int, int>, next_available: ?array{date: string, label: string, slots: array<int, string>}, available_days: array<int, string>}>
     */
    public static function specialists(Team $team): array
    {
        $timezone = $team->timezone ?: config('app.timezone');

        return $team->members()
            ->with([
                'services:id',
                'locations:id',
                'workHours' => fn ($query) => $query->where('team_id', $team->id),
            ])
            ->orderBy('name')
            ->get()
            ->map(function (User $member) use ($timezone): array {
                $availability = static::availability($member, $timezone);

                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'avatar' => $member->avatar,
                    'service_ids' => $member->services->pluck('id')->all(),
                    'location_ids' => $member->locations->pluck('id')->all(),
                    'next_available' => $availability['preview'],
                    'available_days' => $availability['days'],
                ];
            })
            ->all();
    }

    /**
     * Scan the upcoming days for the specialist's genuinely bookable days.
     *
     * A day counts as available when the specialist works it and at least one
     * future half-hour slot is not already taken by an existing appointment.
     * The first such day also seeds a lightweight "next available" preview with
     * a handful of free time labels. Both are teasers only — the real bookable
     * slots are generated per service once a service, specialist and date have
     * all been chosen.
     *
     * @return array{days: array<int, string>, preview: ?array{date: string, label: string, slots: array<int, string>}}
     */
    protected static function availability(User $specialist, string $timezone): array
    {
        if ($specialist->workHours->isEmpty()) {
            return ['days' => [], 'preview' => null];
        }

        $now = CarbonImmutable::now($timezone);
        $windowStart = $now->startOfDay();

        $booked = static::bookedIntervals($specialist, $windowStart, $windowStart->addDays(14));

        $days = [];
        $preview = null;

        for ($offset = 0; $offset < 14; $offset++) {
            $day = $windowStart->addDays($offset);
            $dayOfWeek = $day->dayOfWeekIso - 1; // 0 = Monday ... 6 = Sunday

            $hours = $specialist->workHours
                ->where('day_of_week', $dayOfWeek)
                ->sortBy('start_time');

            if ($hours->isEmpty()) {
                continue;
            }

            $slots = static::previewSlots($hours, $day, $now, $booked, $offset === 0);

            if ($slots === []) {
                continue;
            }

            $days[] = $day->format('Y-m-d');

            if ($preview === null) {
                $preview = [
                    'date' => $day->format('Y-m-d'),
                    'label' => $day->isToday() ? 'Today' : ($day->isTomorrow() ? 'Tomorrow' : $day->format('D, j M')),
                    'slots' => $slots,
                ];
            }
        }

        return ['days' => $days, 'preview' => $preview];
    }

    /**
     * Generate free half-hour preview time labels across a specialist's work
     * windows, skipping past times and slots overlapping existing appointments.
     *
     * @param  Collection<int, WorkHour>  $hours
     * @param  Collection<int, array{0: CarbonInterface, 1: CarbonInterface}>  $booked
     * @return array<int, string>
     */
    protected static function previewSlots(
        Collection $hours,
        CarbonImmutable $day,
        CarbonImmutable $now,
        Collection $booked,
        bool $isToday,
    ): array {
        $slots = [];

        foreach ($hours as $window) {
            $cursor = $day->setTimeFromTimeString($window->start_time);
            $end = $day->setTimeFromTimeString($window->end_time);

            while ($cursor < $end && count($slots) < 12) {
                $slotEnd = $cursor->addMinutes(30);

                $isPast = $isToday && $cursor->lessThanOrEqualTo($now);

                if (! $isPast && ! static::overlapsAny($cursor, $slotEnd, $booked)) {
                    $slots[] = $cursor->format('H:i');
                }

                $cursor = $cursor->addMinutes(30);
            }
        }

        return $slots;
    }

    /**
     * Fetch the specialist's appointment intervals overlapping the given window.
     *
     * @return Collection<int, array{0: CarbonInterface, 1: CarbonInterface}>
     */
    protected static function bookedIntervals(User $specialist, CarbonImmutable $windowStart, CarbonImmutable $windowEnd): Collection
    {
        return Appointment::query()
            ->where('specialist_id', $specialist->id)
            ->where('start_at', '<', $windowEnd->utc())
            ->where('end_at', '>', $windowStart->utc())
            ->get(['start_at', 'end_at'])
            ->map(fn (Appointment $appointment): array => [$appointment->start_at, $appointment->end_at]);
    }

    /**
     * Determine whether a slot overlaps any of the booked intervals.
     *
     * @param  Collection<int, array{0: CarbonInterface, 1: CarbonInterface}>  $booked
     */
    protected static function overlapsAny(CarbonImmutable $slotStart, CarbonImmutable $slotEnd, Collection $booked): bool
    {
        foreach ($booked as [$bookedStart, $bookedEnd]) {
            if ($slotStart->lessThan($bookedEnd) && $slotEnd->greaterThan($bookedStart)) {
                return true;
            }
        }

        return false;
    }
}
