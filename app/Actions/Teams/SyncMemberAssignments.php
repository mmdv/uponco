<?php

namespace App\Actions\Teams;

use App\Models\Team;
use App\Models\User;

class SyncMemberAssignments
{
    /**
     * Replace the member's services within this team (other teams' links are
     * kept). Shared by the web member page and the mobile API.
     *
     * @param  array<int, int>  $serviceIds
     */
    public function services(Team $team, User $member, array $serviceIds): void
    {
        $member->services()->detach($team->services()->pluck('services.id'));
        $member->services()->attach($serviceIds);
    }

    /**
     * Replace the member's locations within this team (other teams' links are
     * kept).
     *
     * @param  array<int, int>  $locationIds
     */
    public function locations(Team $team, User $member, array $locationIds): void
    {
        $member->locations()->detach($team->locations()->pluck('id'));
        $member->locations()->attach($locationIds);
    }
}
