<?php

namespace App\Actions\Teams;

use App\Models\ScheduleSlot;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DeleteTeam
{
    /**
     * Permanently delete a team and every record that hangs off it.
     *
     * The team is force-deleted so the database `cascadeOnDelete` foreign keys
     * fire, removing members, invitations, services, categories, customers,
     * appointments, locations, schedule slots and onboarding progress in one
     * shot. Any other user currently pointed at the team is first moved to one
     * of their remaining teams so they never land on a team that no longer
     * exists.
     */
    public function handle(Team $team, ?User $actingUser = null): void
    {
        $logoPath = $team->logo_path;

        DB::transaction(function () use ($team, $actingUser): void {
            User::where('current_team_id', $team->id)
                ->when($actingUser, fn ($query) => $query->where('id', '!=', $actingUser->id))
                ->each(function (User $affectedUser) use ($team): void {
                    $fallback = $affectedUser->fallbackTeam($team);

                    if ($fallback) {
                        $affectedUser->switchTeam($fallback);
                    }
                });

            $team->forceDelete();
        });

        if ($logoPath) {
            Storage::disk('public')->delete($logoPath);
        }
    }

    /**
     * Count everything that would be permanently deleted with the team.
     *
     * Drives the "this will delete …" preview shown before the owner confirms.
     *
     * @return array{members: int, services: int, customers: int, appointments: int, locations: int, serviceCategories: int, scheduleSlots: int, invitations: int}
     */
    public static function summary(Team $team): array
    {
        return [
            'members' => $team->memberships()->count(),
            'services' => $team->services()->count(),
            'customers' => $team->customers()->count(),
            'appointments' => $team->appointments()->count(),
            'locations' => $team->locations()->count(),
            'serviceCategories' => $team->serviceCategories()->count(),
            'scheduleSlots' => ScheduleSlot::where('team_id', $team->id)->count(),
            'invitations' => $team->invitations()->whereNull('accepted_at')->count(),
        ];
    }
}
