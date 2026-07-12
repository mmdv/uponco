<?php

namespace App\Http\Controllers;

use App\Enums\TeamRole;
use App\Http\Requests\Schedule\SaveScheduleRequest;
use App\Models\ScheduleSlot;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    /**
     * Display the monthly scheduling page.
     *
     * Managers (owners/admins) schedule the whole team, so they receive every
     * member as a grid row; plain members only schedule themselves. Existing
     * slots are returned keyed by `${userId}:${date}` so the grid can flag days
     * that already have hours and pre-fill the editor.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $user->currentTeam;

        $isManager = $user->teamRole($team)?->isAtLeast(TeamRole::Admin) ?? false;

        $members = $isManager
            ? $team->members()->get()
            : $team->members()->wherePivot('user_id', $user->id)->get();

        $slots = ScheduleSlot::query()
            ->where('team_id', $team->id)
            ->whereIn('user_id', $members->pluck('id'))
            ->orderBy('start_time')
            ->get();

        return Inertia::render('schedule/index', [
            'members' => $members->map(fn (User $member): array => [
                'id' => $member->id,
                'name' => $member->name,
                'avatar' => $member->avatar ?? null,
                'role' => $member->pivot->role->value,
            ])->values(),
            'slots' => $this->toSlotMap($slots),
        ]);
    }

    /**
     * Persist the submitted slots for every selected member/day.
     *
     * Each (member, day) is replaced wholesale — existing slots for that day are
     * deleted and the submitted set inserted — so re-saving a day that already
     * has hours simply overwrites it.
     */
    public function store(SaveScheduleRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $assignments = $request->validated('assignments');
        $slots = $request->validated('slots');

        DB::transaction(function () use ($team, $assignments, $slots): void {
            $now = now();

            foreach ($assignments as $assignment) {
                ScheduleSlot::where('team_id', $team->id)
                    ->where('user_id', $assignment['user_id'])
                    ->whereDate('date', $assignment['date'])
                    ->delete();

                ScheduleSlot::insert(array_map(fn (array $slot): array => [
                    'team_id' => $team->id,
                    'user_id' => $assignment['user_id'],
                    'date' => $assignment['date'],
                    'start_time' => $slot['start'],
                    'end_time' => $slot['end'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ], $slots));
            }
        });

        return back()->with('status', 'schedule-updated');
    }

    /**
     * Group slots into a `${userId}:${date}` => [{start, end}] map matching the
     * front-end cell id, so a cell can look up its slots in one hit.
     *
     * @param  Collection<int, ScheduleSlot>  $slots
     * @return array<string, array<int, array{start: string, end: string}>>
     */
    protected function toSlotMap(Collection $slots): array
    {
        return $slots
            ->groupBy(fn (ScheduleSlot $slot): string => $slot->user_id.':'.$slot->date->format('Y-m-d'))
            ->map(fn (Collection $daySlots): array => $daySlots
                ->map(fn (ScheduleSlot $slot): array => [
                    'start' => substr((string) $slot->start_time, 0, 5),
                    'end' => substr((string) $slot->end_time, 0, 5),
                ])
                ->values()
                ->all())
            ->all();
    }
}
