<?php

namespace App\Actions\Schedule;

use App\Models\ScheduleSlot;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SaveMemberSchedule
{
    /**
     * Replace the given days of a member's schedule.
     *
     * Each day is replaced wholesale — its existing slots are deleted and the
     * submitted ones inserted — so an empty `slots` array clears the day, which
     * is how a day off is recorded. Shared by the web schedule editor and the
     * mobile API.
     *
     * @param  array<int, array{date: string, slots: array<int, array{start: string, end: string}>}>  $days
     */
    public function handle(Team $team, User $member, array $days): void
    {
        DB::transaction(function () use ($team, $member, $days): void {
            $now = now();

            foreach ($days as $day) {
                ScheduleSlot::where('team_id', $team->id)
                    ->where('user_id', $member->id)
                    ->whereDate('date', $day['date'])
                    ->delete();

                if ($day['slots'] === []) {
                    continue;
                }

                ScheduleSlot::insert(array_map(fn (array $slot): array => [
                    'team_id' => $team->id,
                    'user_id' => $member->id,
                    'date' => $day['date'],
                    'start_time' => $slot['start'],
                    'end_time' => $slot['end'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ], $day['slots']));
            }
        });
    }
}
