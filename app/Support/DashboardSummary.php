<?php

namespace App\Support;

use App\Concerns\InteractsWithAppointmentBooking;
use App\Enums\TeamPermission;
use App\Models\Appointment;
use App\Models\Team;
use App\Models\User;
use Carbon\CarbonImmutable;

/**
 * The numbers and lists on the dashboard, shared by the web dashboard and the
 * mobile API so both show exactly the same thing.
 *
 * Members with the view-all-appointments permission (admins and owners have it
 * by role) see the whole team's bookings; everyone else only their own.
 */
class DashboardSummary
{
    use InteractsWithAppointmentBooking;

    public function __construct(
        public readonly Team $team,
        public readonly string $timezone,
        public readonly ?int $specialistId,
    ) {
        //
    }

    /**
     * Build the summary as the given user sees it on their current team.
     */
    public static function for(User $user, Team $team): self
    {
        return new self(
            team: $team,
            timezone: $team->timezone ?: config('app.timezone'),
            specialistId: $user->hasTeamPermission($team, TeamPermission::ViewAllAppointments) ? null : $user->id,
        );
    }

    /**
     * The headline metrics. Booking counts follow the specialist scope;
     * customers, services and locations are team-wide.
     *
     * @return array{customers: int, totalBookings: int, upcoming: int, services: int, locations: int}
     */
    public function stats(): array
    {
        $bookings = fn () => $this->team->appointments()
            ->booked()
            ->when($this->specialistId, fn ($query) => $query->where('specialist_id', $this->specialistId));

        return [
            'customers' => $this->team->customers()->count(),
            'totalBookings' => $bookings()->count(),
            'upcoming' => $bookings()->where('start_at', '>=', now())->count(),
            'services' => $this->team->services()->count(),
            'locations' => $this->team->locations()->count(),
        ];
    }

    /**
     * Bookings per day for today plus the next six days, in the team's timezone.
     *
     * @return array<int, array{label: string, date: string, count: int, isToday: bool}>
     */
    public function weeklyTrend(): array
    {
        $start = CarbonImmutable::now($this->timezone)->startOfDay();
        $end = $start->addDays(7);
        $today = $start->toDateString();

        $counts = $this->team->appointments()
            ->booked()
            ->when($this->specialistId, fn ($query) => $query->where('specialist_id', $this->specialistId))
            ->whereBetween('start_at', [$start->utc(), $end->utc()])
            ->get(['start_at'])
            ->groupBy(fn (Appointment $appointment): string => $appointment->start_at
                ->setTimezone($this->timezone)
                ->toDateString())
            ->map->count();

        return collect(range(0, 6))
            ->map(function (int $offset) use ($start, $counts, $today): array {
                $day = $start->addDays($offset);
                $date = $day->toDateString();

                return [
                    'label' => $day->format('D'),
                    'date' => $date,
                    'count' => (int) $counts->get($date, 0),
                    'isToday' => $date === $today,
                ];
            })
            ->all();
    }

    /**
     * The next few booked appointments, soonest first.
     *
     * @return array<int, array<string, mixed>>
     */
    public function upcomingAppointments(int $limit = 6): array
    {
        return $this->team->appointments()
            ->booked()
            ->with(['service:id,title', 'location:id,name', 'specialist:id,name', 'customer:id,name,email,phone'])
            ->when($this->specialistId, fn ($query) => $query->where('specialist_id', $this->specialistId))
            ->where('start_at', '>=', now())
            ->orderBy('start_at')
            ->limit($limit)
            ->get()
            ->map(fn (Appointment $appointment): array => $this->toAppointmentArray($appointment, $this->timezone))
            ->all();
    }
}
