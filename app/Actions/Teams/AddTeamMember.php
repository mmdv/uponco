<?php

namespace App\Actions\Teams;

use App\Enums\OnboardingStep;
use App\Enums\OnboardingStepStatus;
use App\Enums\TeamRole;
use App\Models\OnboardingProgress;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AddTeamMember
{
    /**
     * Create an account and add it to the team as a plain member, with
     * onboarding already complete (the team is set up). Shared by the web
     * members page and the mobile API.
     *
     * The admin typed this address; nobody has proved they can read it, so the
     * member verifies it themselves like any other account — an admin cannot
     * mint a pre-verified account at an address they do not own.
     *
     * @param  array{name: string, surname?: ?string, job_title?: ?string, email: string, password: string}  $data
     */
    public function handle(Team $team, array $data): User
    {
        $name = Str::squish($data['name'].' '.($data['surname'] ?? ''));

        $member = DB::transaction(function () use ($team, $data, $name): User {
            $member = User::create([
                'name' => $name,
                'email' => $data['email'],
                'password' => $data['password'],
            ]);

            $team->memberships()->create([
                'user_id' => $member->id,
                'role' => TeamRole::Member,
            ]);

            $member->profile()->create([
                'email' => $data['email'],
                'job_title' => $data['job_title'] ?? null,
            ]);

            OnboardingProgress::create([
                'team_id' => $team->id,
                'user_id' => $member->id,
                'services_status' => OnboardingStepStatus::Completed,
                'profile_status' => OnboardingStepStatus::Completed,
                'schedule_status' => OnboardingStepStatus::Completed,
                'current_step' => OnboardingStep::Schedule,
                'completed_at' => now(),
            ]);

            $member->switchTeam($team);

            return $member;
        });

        $member->sendEmailVerificationNotification();

        return $member;
    }
}
