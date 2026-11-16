<?php

namespace App\Actions\Users;

use App\Actions\Teams\DeleteTeam;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DeleteAccount
{
    public function __construct(protected DeleteTeam $deleteTeam) {}

    /**
     * Delete the user and every team they own alone (nobody could inherit
     * them). Teams they share must have been handed over first — the request
     * blocks that case. Shared by the web settings page and the mobile API.
     */
    public function handle(User $user): void
    {
        $soloOwnedTeams = $user->ownedTeams()
            ->withCount('memberships')
            ->get()
            ->filter(fn ($team): bool => $team->memberships_count === 1);

        DB::transaction(function () use ($user, $soloOwnedTeams): void {
            $soloOwnedTeams->each(fn ($team) => $this->deleteTeam->handle($team, $user));
            $user->tokens()->delete();
            $user->delete();
        });
    }
}
