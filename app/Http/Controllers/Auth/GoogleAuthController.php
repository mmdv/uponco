<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Teams\AcceptTeamInvitation;
use App\Actions\Teams\CreateTeam;
use App\Http\Controllers\Controller;
use App\Models\TeamInvitation;
use App\Models\User;
use App\Support\Analytics;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * The OAuth scopes needed to identify the user. Deliberately narrower than
     * the calendar integration (GoogleIntegrationController): social login only
     * needs the user's identity, not offline calendar access.
     *
     * @var array<int, string>
     */
    protected const SCOPES = ['openid', 'email', 'profile'];

    public function __construct(
        private CreateTeam $createTeam,
        private AcceptTeamInvitation $acceptTeamInvitation,
    ) {
        //
    }

    /**
     * Redirect the user to Google's OAuth consent screen for login/signup.
     *
     * The redirect URL is overridden at runtime so this flow uses its own
     * callback, keeping it distinct from the calendar integration which relies
     * on the redirect configured in `config/services.php`.
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')
            ->redirectUrl(route('auth.google.callback'))
            ->scopes(self::SCOPES)
            ->redirect();
    }

    /**
     * Handle the OAuth callback: log the user in, creating an account and a
     * personal team on first sign-in.
     */
    public function callback(Request $request): RedirectResponse
    {
        // The user declined the consent screen.
        if ($request->has('error')) {
            return to_route('login')->with('status', __('Google sign-in was cancelled.'));
        }

        try {
            $googleUser = Socialite::driver('google')
                ->redirectUrl(route('auth.google.callback'))
                ->user();
        } catch (\Throwable $e) {
            report($e);

            return to_route('login')->with('status', __('Could not sign you in with Google. Please try again.'));
        }

        // A pending invitation the user arrived with (its code stored in the
        // session by TeamInvitationController) is honoured only when Google
        // confirms the same address, mirroring the register/login flows.
        $invitation = $this->pendingInvitationFor($request, $googleUser->getEmail());

        [$user, $isNewUser] = $this->resolveUser($googleUser, $invitation);

        Auth::login($user, remember: true);

        if ($invitation instanceof TeamInvitation) {
            // Joining the (already-onboarded) inviting team instead of getting a
            // fresh personal one, so send the user straight to the dashboard.
            $this->acceptTeamInvitation->handle($user, $invitation);
            $request->session()->forget('team_invitation');

            return redirect('/dashboard');
        }

        if ($isNewUser) {
            return redirect('/onboard');
        }

        // Mirror RegisterResponse: returning users go straight to the dashboard
        // unless their team still needs onboarding.
        $team = $user->currentTeam;

        return redirect($team !== null && ! $team->needsOnboarding() ? '/dashboard' : '/onboard');
    }

    /**
     * Resolve a pending invitation stored in the session that matches the
     * Google-verified email, if any.
     */
    private function pendingInvitationFor(Request $request, string $email): ?TeamInvitation
    {
        $code = $request->session()->get('team_invitation');

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

    /**
     * Find the user for this Google identity, or create one on first sign-in.
     *
     * Matching falls back from the stable Google id to the (Google-verified)
     * email so an existing password account is linked rather than duplicated.
     *
     * @return array{0: User, 1: bool} the user and whether it was just created
     */
    private function resolveUser(\Laravel\Socialite\Contracts\User $googleUser, ?TeamInvitation $invitation): array
    {
        $existing = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if ($existing !== null) {
            if (blank($existing->google_id)) {
                $existing->forceFill(['google_id' => $googleUser->getId()])->save();
            }

            return [$existing, false];
        }

        $user = DB::transaction(function () use ($googleUser, $invitation) {
            $user = User::create([
                'name' => $googleUser->getName() ?: $googleUser->getEmail(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'password' => null,
            ]);

            // Google has already verified the address, so skip our own
            // verification step. Terms are handled by the app's legal-consent
            // gate on arrival rather than recorded here.
            $user->forceFill(['email_verified_at' => now()])->save();

            // Invited users join the inviting team (accepted by the caller after
            // login) rather than getting a personal team of their own.
            if (! $invitation instanceof TeamInvitation) {
                $this->createTeam->handle($user, isPersonal: true);
            }

            return $user;
        });

        Analytics::record('signup_completed');

        return [$user, true];
    }
}
