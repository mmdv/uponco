<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UserResource;
use App\Models\Team;
use Illuminate\Http\Request;

class CurrentTeamController extends Controller
{
    /**
     * Switch the user's current team. Like the web switcher, the current team
     * is stored on the user, so every later API call is scoped to it.
     */
    public function update(Request $request): UserResource
    {
        $request->validate([
            'team_id' => ['required', 'integer'],
        ]);

        $team = Team::find($request->integer('team_id'));

        abort_unless($team !== null && $request->user()->belongsToTeam($team), 403);

        $request->user()->switchTeam($team);

        return new UserResource($request->user()->refresh());
    }
}
