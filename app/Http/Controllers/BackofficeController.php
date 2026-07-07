<?php

namespace App\Http\Controllers;

use App\Http\Requests\Backoffice\DeleteBackofficeTeamRequest;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BackofficeController extends Controller
{
    /**
     * Show the operator backoffice: every team with its members.
     */
    public function index(): Response
    {
        $teams = Team::query()
            ->with(['members' => fn ($query) => $query->orderBy('name')])
            ->withCount(['members', 'locations', 'appointments'])
            ->orderBy('name')
            ->get()
            ->map(fn (Team $team): array => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
                'isPersonal' => $team->is_personal,
                'createdAt' => $team->created_at?->toISOString(),
                'membersCount' => $team->members_count,
                'locationsCount' => $team->locations_count,
                'appointmentsCount' => $team->appointments_count,
                'members' => $team->members->map(fn (User $member): array => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'avatar' => $member->avatar ?? null,
                    'role' => $member->pivot->role->value,
                    'roleLabel' => $member->pivot->role->label(),
                ])->values(),
            ]);

        return Inertia::render('backoffice/index', [
            'teams' => $teams,
        ]);
    }

    /**
     * Delete a team and detach any users currently pointed at it.
     */
    public function destroyTeam(DeleteBackofficeTeamRequest $request, string $current_team, Team $team): RedirectResponse
    {
        DB::transaction(function () use ($team): void {
            User::where('current_team_id', $team->id)
                ->each(function (User $affectedUser) use ($team): void {
                    $fallback = $affectedUser->fallbackTeam($team);

                    if ($fallback !== null) {
                        $affectedUser->switchTeam($fallback);
                    } else {
                        $affectedUser->update(['current_team_id' => null]);
                    }
                });

            $team->invitations()->delete();
            $team->memberships()->delete();
            $team->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Team deleted.')]);

        return back();
    }

    /**
     * Delete a user. Their memberships (and cascaded data) are removed by the
     * database foreign keys.
     */
    public function destroyUser(Request $request, string $current_team, User $user): RedirectResponse
    {
        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User deleted.')]);

        return back();
    }
}
