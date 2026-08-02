<?php

namespace App\Support;

use App\Models\ScheduleSlot;
use App\Models\Team;
use App\Models\User;
use Carbon\CarbonImmutable;

class ScheduleSummary
{
    /**
     * Build the availability summary for the next 7 days for the given user.
     *
     * Availability is date-based, so the summary reflects the actual slots
     * scheduled across the upcoming week — today through six days ahead in the
     * team timezone — rather than the calendar week or a recurring template.
     *
     * @return array{days: array<int, array{key: string, label: string, minutes: int, isToday: bool}>, totalMinutes: int, openNow: bool}
     */
    public static function forUser(User $user, Team $team): array
    {
        $timezone = $team->timezone ?: config('app.timezone');
        $now = CarbonImmutable::now($timezone);
        $rangeStart = $now->startOfDay();
        $today = $now->format('Y-m-d');
        $nowTime = $now->format('H:i:s');

        $slots = $user->scheduleSlotsFor($team)
            ->whereBetween('date', [$rangeStart->format('Y-m-d'), $rangeStart->addDays(6)->format('Y-m-d')])
            ->get()
            ->groupBy(fn (ScheduleSlot $slot): string => $slot->date->format('Y-m-d'));

        $totalMinutes = 0;
        $openNow = false;
        $days = [];

        for ($offset = 0; $offset < 7; $offset++) {
            $day = $rangeStart->addDays($offset);
            $dateKey = $day->format('Y-m-d');
            $daySlots = $slots->get($dateKey, collect());

            $minutes = (int) $daySlots->sum(fn (ScheduleSlot $slot): int => (int) CarbonImmutable::parse($slot->start_time)
                ->diffInMinutes(CarbonImmutable::parse($slot->end_time)));

            $totalMinutes += $minutes;

            if ($dateKey === $today) {
                $openNow = $daySlots->contains(fn (ScheduleSlot $slot): bool => $nowTime >= substr((string) $slot->start_time, 0, 8)
                    && $nowTime <= substr((string) $slot->end_time, 0, 8));
            }

            $days[] = [
                'key' => $dateKey,
                'label' => strtoupper(substr($day->format('l'), 0, 1)),
                'minutes' => $minutes,
                'isToday' => $dateKey === $today,
            ];
        }

        return [
            'days' => $days,
            'totalMinutes' => $totalMinutes,
            'openNow' => $openNow,
        ];
    }
}
