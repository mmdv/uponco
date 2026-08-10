<?php

namespace App\Support;

use App\Models\ScheduleSlot;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Builds the date-keyed slot map consumed by the per-member schedule views.
 *
 * Unlike the team grid — which loads every slot for every member — these views
 * show one person over one week or month, so the query is always range-scoped.
 */
final class ScheduleSlotMap
{
    /**
     * A member's slots between two dates, keyed by `Y-m-d`.
     *
     * Days with no slots are simply absent from the map; the front-end treats a
     * missing key as a day off.
     *
     * @return array<string, array<int, array{start: string, end: string}>>
     */
    public static function forMember(Team $team, User $member, string $from, string $to): array
    {
        $slots = ScheduleSlot::query()
            ->where('team_id', $team->id)
            ->where('user_id', $member->id)
            ->whereBetween('date', [$from, $to])
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        return $slots
            ->groupBy(fn (ScheduleSlot $slot): string => $slot->date->format('Y-m-d'))
            ->map(fn (Collection $daySlots): array => self::windows($daySlots))
            ->all();
    }

    /**
     * Every member's working windows on a single date, keyed by user id.
     *
     * Days off are simply absent (a member with no slots that date does not
     * appear). Optionally restrict to a single member — members may only see
     * their own column on the team schedule.
     *
     * @return array<int, array<int, array{start: string, end: string}>>
     */
    public static function forTeamOnDate(Team $team, string $date, ?int $onlyUserId = null): array
    {
        $slots = ScheduleSlot::query()
            ->where('team_id', $team->id)
            ->whereDate('date', $date)
            ->when($onlyUserId !== null, fn ($query) => $query->where('user_id', $onlyUserId))
            ->orderBy('user_id')
            ->orderBy('start_time')
            ->get();

        return $slots
            ->groupBy(fn (ScheduleSlot $slot): int => $slot->user_id)
            ->map(fn (Collection $memberSlots): array => self::windows($memberSlots))
            ->all();
    }

    /**
     * Map a collection of slots to their `{start, end}` HH:MM windows.
     *
     * @param  Collection<int, ScheduleSlot>  $slots
     * @return array<int, array{start: string, end: string}>
     */
    protected static function windows(Collection $slots): array
    {
        return $slots
            ->map(fn (ScheduleSlot $slot): array => [
                'start' => substr((string) $slot->start_time, 0, 5),
                'end' => substr((string) $slot->end_time, 0, 5),
            ])
            ->values()
            ->all();
    }
}
