<?php

namespace App\Http\Controllers\Teams;

use App\Actions\Teams\AcceptTeamInvitation;
use App\Http\Controllers\Controller;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TeamInvitationController extends Controller
{
    public function __construct(private AcceptTeamInvitation $acceptTeamInvitation)
    {
        //
    }

    /**
     * Handle the invitation link.
     *
     * The link is public: guests are routed to signup (or login if they already
     * have an account), while an authenticated recipient with a matching email
     * is added to the team straight away.
     */
    public function accept(Request $request, TeamInvitation $invitation): RedirectResponse
    {
        if (! $invitation->isPending()) {
            return to_route('login')->with('status', __('This invitation is no longer valid.'));
        }

        $user = $request->user();

        if ($user instanceof User) {
            if (strtolower($user->email) !== strtolower($invitation->email)) {
                return to_route('dashboard')->with('status', __('This invitation was sent to a different email address.'));
            }

            if (! $user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
            }

            $this->acceptTeamInvitation->handle($user, $invitation);

            return to_route('dashboard');
        }

        $request->session()->put('team_invitation', $invitation->code);

        if (User::where('email', $invitation->email)->exists()) {
            return to_route('login');
        }

        return to_route('register');
    }
}
