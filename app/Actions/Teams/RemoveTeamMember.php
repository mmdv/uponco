<?php

namespace App\Actions\Teams;

use App\Models\Team;
use App\Models\User;

class RemoveTeamMember
{
    /**
     * Take the member off the team (never the owner — callers check), moving
     * them onto another of their teams if this one was current. Shared by the
     * web members page and the mobile API.
     */
    public function handle(Team $team, User $member): void
    {
        $team->memberships()
            ->where('user_id', $member->id)
            ->delete();

        if ($member->isCurrentTeam($team)) {
            $fallback = $member->fallbackTeam($team);

            if ($fallback) {
                $member->switchTeam($fallback);
            }
        }
    }
}
