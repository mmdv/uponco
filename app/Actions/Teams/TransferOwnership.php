<?php

namespace App\Actions\Teams;

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TransferOwnership
{
    /**
     * Hand the team to another member; the current owner becomes an admin so
     * the team always has exactly one owner. Shared by the web members page
     * and the mobile API.
     */
    public function handle(Team $team, User $currentOwner, User $newOwner): void
    {
        DB::transaction(function () use ($team, $currentOwner, $newOwner): void {
            $team->memberships()->where('user_id', $newOwner->id)->firstOrFail()->update(['role' => TeamRole::Owner]);
            $team->memberships()->where('user_id', $currentOwner->id)->firstOrFail()->update(['role' => TeamRole::Admin]);
        });
    }
}
