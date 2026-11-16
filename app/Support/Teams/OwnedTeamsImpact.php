<?php

namespace App\Support\Teams;

use App\Actions\Teams\DeleteTeam;
use App\Models\Team;
use App\Models\User;

/**
 * What deleting an account would do to the teams the user owns: teams they
 * own alone are deleted with it; shared ones must be handed over first.
 * Shared by the web security page and the mobile API.
 */
final class OwnedTeamsImpact
{
    /**
     * @return array{solo: array<int, array{name: string, summary: mixed}>, shared: array<int, array{name: string, memberCount: int}>}
     */
    public static function for(User $user): array
    {
        $teams = $user->ownedTeams()->withCount('memberships')->get();

        return [
            'solo' => $teams
                ->filter(fn (Team $team): bool => $team->memberships_count === 1)
                ->map(fn (Team $team): array => [
                    'name' => $team->name,
                    'summary' => DeleteTeam::summary($team),
                ])
                ->values()
                ->all(),
            'shared' => $teams
                ->filter(fn (Team $team): bool => $team->memberships_count > 1)
                ->map(fn (Team $team): array => [
                    'name' => $team->name,
                    'memberCount' => $team->memberships_count,
                ])
                ->values()
                ->all(),
        ];
    }
}
