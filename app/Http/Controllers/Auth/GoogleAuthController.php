<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Teams\CreateTeam;
use App\Http\Controllers\Controller;
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

        [$user, $isNewUser] = $this->resolveUser($googleUser);

        Auth::login($user, remember: true);

        if ($isNewUser) {
            return redirect('/onboard');
        }

        // Mirror RegisterResponse: returning users go straight to the dashboard
        // unless their team still needs onboarding.
        $team = $user->currentTeam;

        return redirect($team !== null && ! $team->needsOnboarding() ? '/dashboard' : '/onboard');
    }

    /**
     * Find the user for this Google identity, or create one on first sign-in.
     *
     * Matching falls back from the stable Google id to the (Google-verified)
     * email so an existing password account is linked rather than duplicated.
     *
     * @return array{0: User, 1: bool} the user and whether it was just created
     */
    private function resolveUser(\Laravel\Socialite\Contracts\User $googleUser): array
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

        $user = DB::transaction(function () use ($googleUser) {
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

            $this->createTeam->handle($user, isPersonal: true);

            return $user;
        });

        Analytics::record('signup_completed');

        return [$user, true];
    }
}
