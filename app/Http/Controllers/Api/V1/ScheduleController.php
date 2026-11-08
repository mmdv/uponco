<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Schedule\SaveMemberSchedule;
use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Schedule\SaveMemberScheduleRequest;
use App\Models\Team;
use App\Models\User;
use App\Support\ScheduleSlotMap;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

/**
 * Working hours (SCHED-1..4) for the mobile app: the same per-member,
 * per-date blocks as the web week/month editor. Everyone edits their own
 * hours; owners and admins can also edit any member of the team.
 */
class ScheduleController extends Controller
{
    /** Longest range one request may read (a month grid is 42 days). */
    protected const MAX_DAYS = 62;

    /**
     * The people the user may schedule: the whole team for managers, just
     * themselves otherwise.
     */
    public function members(Request $request): JsonResponse
    {
        $user = $request->user();
        $team = $user->currentTeam;

        $members = $this->isManager($user, $team)
            ? $team->members()->orderBy('name')->get()
            : $team->members()->wherePivot('user_id', $user->id)->get();

        return response()->json([
            'data' => $members->map(fn (User $member): array => [
                'id' => $member->id,
                'name' => $member->name,
                'avatar' => $member->avatar ?? null,
                'role' => $member->pivot->role->value,
            ])->values(),
        ]);
    }

    /**
     * A member's hours for every day in `from`..`to`; a day with no blocks is
     * a day off.
     */
    public function show(Request $request, int $member): JsonResponse
    {
        $data = $request->validate([
            'from' => ['required', 'date_format:Y-m-d'],
            'to' => ['required', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        $from = CarbonImmutable::createFromFormat('Y-m-d', $data['from'])->startOfDay();
        $to = CarbonImmutable::createFromFormat('Y-m-d', $data['to'])->startOfDay();

        if ($from->diffInDays($to) >= self::MAX_DAYS) {
            throw ValidationException::withMessages(['to' => __('Choose a shorter date range.')]);
        }

        $team = $request->user()->currentTeam;
        $person = $this->schedulableMember($request->user(), $team, $member);
        $map = ScheduleSlotMap::forMember($team, $person, $from->format('Y-m-d'), $to->format('Y-m-d'));

        $days = [];

        for ($day = $from; $day <= $to; $day = $day->addDay()) {
            $key = $day->format('Y-m-d');
            $days[] = ['date' => $key, 'slots' => $map[$key] ?? []];
        }

        return response()->json([
            'data' => [
                'member' => ['id' => $person->id, 'name' => $person->name, 'avatar' => $person->avatar ?? null],
                'timezone' => $team->timezone ?: config('app.timezone'),
                'days' => $days,
            ],
        ]);
    }

    /**
     * Replace whole days of a member's schedule (an empty `slots` list is a
     * day off) — one day, several days, or a week repeated forward.
     */
    public function update(SaveMemberScheduleRequest $request, User $user, SaveMemberSchedule $saveMemberSchedule): Response
    {
        $saveMemberSchedule->handle($request->user()->currentTeam, $user, $request->validated('days'));

        return response()->noContent();
    }

    protected function isManager(User $user, Team $team): bool
    {
        return $user->teamRole($team)?->isAtLeast(TeamRole::Admin) ?? false;
    }

    /**
     * The member whose hours are requested, or 404 when the user may not see
     * them (a colleague for a plain member, or someone outside the team).
     */
    protected function schedulableMember(User $user, Team $team, int $memberId): User
    {
        if ($memberId === $user->id) {
            return $user;
        }

        abort_unless($this->isManager($user, $team), 404);

        return $team->members()->whereKey($memberId)->firstOrFail();
    }
}
