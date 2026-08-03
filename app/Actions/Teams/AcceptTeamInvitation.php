<?php

namespace App\Actions\Teams;

use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AcceptTeamInvitation
{
    /**
     * Add the user to the invitation's team, mark the invitation accepted and
     * switch the user onto that team.
     */
    public function handle(User $user, TeamInvitation $invitation): Team
    {
        return DB::transaction(function () use ($user, $invitation): Team {
            $team = $invitation->team;

            $team->memberships()->firstOrCreate(
                ['user_id' => $user->id],
                ['role' => $invitation->role],
            );

            $invitation->update(['accepted_at' => now()]);

            $user->switchTeam($team);

            return $team;
        });
    }
}
