<?php

namespace App\Actions\Fortify;

use App\Actions\Teams\AcceptTeamInvitation;
use App\Actions\Teams\CreateTeam;
use App\Concerns\AccountValidationRules;
use App\Concerns\PasswordValidationRules;
use App\Models\TeamInvitation;
use App\Models\User;
use App\Support\Analytics;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use AccountValidationRules, PasswordValidationRules;

    public function __construct(
        private CreateTeam $createTeam,
        private AcceptTeamInvitation $acceptTeamInvitation,
    ) {
        //
    }

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->accountRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $invitation = $this->pendingInvitationFor($input['email']);

        $user = DB::transaction(function () use ($input, $invitation) {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
            ]);

            if ($invitation instanceof TeamInvitation) {
                // Clicking the emailed link proves ownership of the address, so the
                // invited user is verified and joins the (already-onboarded) team
                // straight away rather than getting a fresh personal team.
                $user->forceFill(['email_verified_at' => now()])->save();

                $this->acceptTeamInvitation->handle($user, $invitation);
            } else {
                $this->createTeam->handle($user, isPersonal: true);
            }

            return $user;
        });

        if ($invitation instanceof TeamInvitation) {
            session()->forget('team_invitation');
        }

        Analytics::record('signup_completed');

        return $user;
    }

    /**
     * Resolve a pending invitation stored in the session that matches the
     * registering email, if any.
     */
    private function pendingInvitationFor(string $email): ?TeamInvitation
    {
        $code = session('team_invitation');

        if (! is_string($code) || $code === '') {
            return null;
        }

        $invitation = TeamInvitation::where('code', $code)->first();

        if ($invitation === null || ! $invitation->isPending()) {
            return null;
        }

        if (strtolower($invitation->email) !== strtolower($email)) {
            return null;
        }

        return $invitation;
    }
}
