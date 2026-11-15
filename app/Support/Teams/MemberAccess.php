<?php

namespace App\Support\Teams;

use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

/**
 * Who may manage which team member. Shared by the web member pages and the
 * mobile API so both apply the same rules.
 */
final class MemberAccess
{
    /**
     * Ensure the actor may manage this member of their current team: they need
     * the member:update permission, the member must belong to the team (404
     * otherwise), and only the owner may manage the owner.
     */
    public static function authorize(User $actor, User $member): Team
    {
        $team = $actor->currentTeam;

        Gate::forUser($actor)->authorize('updateMember', $team);

        abort_unless($member->belongsToTeam($team), 404);

        abort_if(
            self::isOwnerProtected($team, $actor, $member),
            403,
            __('Only the owner can manage the team owner.'),
        );

        return $team;
    }

    /**
     * Whether the member is the owner and the actor is someone else.
     */
    public static function isOwnerProtected(Team $team, User $actor, User $member): bool
    {
        $owner = $team->owner();

        return $owner !== null && $owner->is($member) && ! $owner->is($actor);
    }
}
