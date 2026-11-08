<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Support\DashboardSummary;
use App\Support\ScheduleSummary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * The mobile Today screen: the same stats, week trend and upcoming
     * appointments as the web dashboard, plus the member's own week of
     * working hours and the team's public booking link to share.
     *
     * Unlike the web, owners and admins are not sent to the onboarding
     * checklist first: the app only gates on the team's core setup.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $team = $user->currentTeam;
        $summary = DashboardSummary::for($user, $team);
        $isTeamAdmin = $user->teamRole($team)?->isAtLeast(TeamRole::Admin) ?? false;
        $stats = $summary->stats();

        return response()->json([
            'data' => [
                'timezone' => $summary->timezone,
                'sees_all_appointments' => $summary->specialistId === null,
                'stats' => [
                    'customers' => $stats['customers'],
                    'total_bookings' => $stats['totalBookings'],
                    'upcoming' => $stats['upcoming'],
                    'services' => $stats['services'],
                    'locations' => $stats['locations'],
                ],
                'weekly_trend' => collect($summary->weeklyTrend())
                    ->map(fn (array $day): array => [
                        'date' => $day['date'],
                        'count' => $day['count'],
                        'is_today' => $day['isToday'],
                    ])
                    ->all(),
                'upcoming_appointments' => $summary->upcomingAppointments(),
                'schedule' => $isTeamAdmin ? null : $this->schedule(ScheduleSummary::forUser($user, $team)),
                'booking_url' => route('public.appointments.show', ['company' => $team->slug]),
            ],
        ]);
    }

    /**
     * @param  array{days: array<int, array{key: string, label: string, minutes: int, isToday: bool}>, totalMinutes: int, openNow: bool}  $schedule
     * @return array{days: array<int, array{date: string, minutes: int, is_today: bool}>, total_minutes: int, open_now: bool}
     */
    protected function schedule(array $schedule): array
    {
        return [
            'days' => collect($schedule['days'])
                ->map(fn (array $day): array => [
                    'date' => $day['key'],
                    'minutes' => $day['minutes'],
                    'is_today' => $day['isToday'],
                ])
                ->all(),
            'total_minutes' => $schedule['totalMinutes'],
            'open_now' => $schedule['openNow'],
        ];
    }
}
