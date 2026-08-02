<?php

namespace App\Http\Controllers\Teams;

use App\Actions\Teams\CreateTeam;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teams\SaveTeamRequest;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    /**
     * Store a newly created team.
     */
    public function store(SaveTeamRequest $request, CreateTeam $createTeam): RedirectResponse
    {
        $team = $createTeam->handle($request->user(), $request->validated('name'));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Team created.')]);

        return to_route('company.business.edit');
    }

    /**
     * Switch the user's current team.
     */
    public function switch(Request $request, Team $team): RedirectResponse
    {
        abort_unless($request->user()->belongsToTeam($team), 403);

        $request->user()->switchTeam($team);

        // Detail pages reference records owned by the previous team, so a
        // switch always lands somewhere safe.
        return to_route('dashboard');
    }
}
