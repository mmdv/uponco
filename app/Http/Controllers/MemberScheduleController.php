<?php

namespace App\Http\Controllers;

use App\Http\Requests\Schedule\SaveMemberScheduleRequest;
use App\Models\ScheduleSlot;
use App\Models\Team;
use App\Models\User;
use App\Support\ScheduleSlotMap;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MemberScheduleController extends Controller
{
    /**
     * The authenticated user's own schedule, in the week/month editor.
     *
     * Plain members cannot reach the team-member edit screen, so this is their
     * way into the same editor. Managers can use it too — it is simply their
     * own row without the member picker.
     */
    public function show(Request $request): Response
    {
        $user = $request->user();
        $team = $user->currentTeam;

        return Inertia::render('schedule/my', [
            'member' => [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar ?? null,
            ],
            // Unlike the member-edit section — where the schedule is one tab of
            // five — the schedule *is* this page, so it loads with it rather
            // than costing an extra round-trip and a skeleton on every visit.
            'schedule' => static::scheduleFor($request, $team, $user),
        ]);
    }

    /**
     * Replace the given days of a member's schedule.
     *
     * Each submitted day is replaced wholesale — its existing slots are deleted
     * and the submitted ones inserted — so an empty `slots` array clears the
     * day, which is how a day off is recorded.
     */
    public function update(SaveMemberScheduleRequest $request, User $user): RedirectResponse
    {
        $team = $request->user()->currentTeam;
        $days = $request->validated('days');

        DB::transaction(function () use ($team, $user, $days): void {
            $now = now();

            foreach ($days as $day) {
                ScheduleSlot::where('team_id', $team->id)
                    ->where('user_id', $user->id)
                    ->whereDate('date', $day['date'])
                    ->delete();

                if ($day['slots'] === []) {
                    continue;
                }

                ScheduleSlot::insert(array_map(fn (array $slot): array => [
                    'team_id' => $team->id,
                    'user_id' => $user->id,
                    'date' => $day['date'],
                    'start_time' => $slot['start'],
                    'end_time' => $slot['end'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ], $day['slots']));
            }
        });

        return back()->with('status', 'member-schedule-updated');
    }

    /**
     * The member's slot map for the range requested by the editor, falling back
     * to the current month when the range is missing or malformed.
     *
     * @return array<string, array<int, array{start: string, end: string}>>
     */
    public static function scheduleFor(Request $request, Team $team, User $member): array
    {
        [$from, $to] = static::requestedRange($request);

        return ScheduleSlotMap::forMember($team, $member, $from, $to);
    }

    /**
     * The `from`/`to` query range as `Y-m-d` strings.
     *
     * @return array{0: string, 1: string}
     */
    protected static function requestedRange(Request $request): array
    {
        $from = static::parseDate($request->query('from'));
        $to = static::parseDate($request->query('to'));

        // The default covers the current month's calendar grid — whole weeks,
        // Monday-start — so it always contains the current week too, whichever
        // view the editor opens on.
        if ($from === null || $to === null || $to->lessThan($from)) {
            $from = Carbon::now()->startOfMonth()->startOfWeek(Carbon::MONDAY);
            $to = Carbon::now()->endOfMonth()->endOfWeek(Carbon::SUNDAY);
        }

        return [$from->format('Y-m-d'), $to->format('Y-m-d')];
    }

    /**
     * Parse a `Y-m-d` query value, or null when it is absent or invalid.
     */
    protected static function parseDate(mixed $value): ?Carbon
    {
        if (! is_string($value)) {
            return null;
        }

        $date = Carbon::createFromFormat('Y-m-d', $value);

        return $date === false ? null : $date->startOfDay();
    }
}
