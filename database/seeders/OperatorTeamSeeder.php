<?php

namespace Database\Seeders;

use App\Http\Middleware\EnsureUponcoTeam;
use App\Models\Team;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OperatorTeamSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Ensure the platform operator team exists and carries `is_operator`.
     *
     * Idempotent, and deliberately refuses to promote a team it did not create:
     * before `is_operator` existed the backoffice was gated on the team *name*,
     * so a pre-existing team called "Uponco" may be a squatter rather than the
     * real operator. Those have to be promoted by hand after inspection.
     */
    public function run(): void
    {
        if (Team::where('is_operator', true)->exists()) {
            $this->command?->info('Operator team already present.');

            return;
        }

        $existing = Team::withTrashed()
            ->where('name', EnsureUponcoTeam::OPERATOR_TEAM_NAME)
            ->first();

        if ($existing !== null) {
            $this->command?->warn(
                "A team named \"{$existing->name}\" (id {$existing->id}) already exists but is not flagged as the operator. "
                .'Verify it is genuinely yours, then set is_operator manually.'
            );

            return;
        }

        $team = Team::create([
            'name' => EnsureUponcoTeam::OPERATOR_TEAM_NAME,
            'slug' => 'uponco',
        ]);

        // Not fillable on purpose — see the note on Team's Fillable attribute.
        $team->forceFill(['is_operator' => true])->save();

        $this->command?->info('Operator team created.');
    }
}
