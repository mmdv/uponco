<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;

class GoogleIntegrationController extends Controller
{
    /**
     * The Google Calendar scope that lets us create events with a Meet link.
     */
    protected const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

    /**
     * The Google OAuth scopes required to create Meet links on the user's calendar.
     *
     * @var array<int, string>
     */
    protected const SCOPES = [
        'openid',
        'email',
        self::CALENDAR_SCOPE,
    ];

    /**
     * Show the integrations settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/integrations', [
            'google' => [
                'connected' => $user->hasGoogleConnected(),
                'email' => $user->google_account_email,
            ],
        ]);
    }

    /**
     * Redirect the user to Google's OAuth consent screen.
     *
     * `access_type=offline` and `prompt=consent` are required so Google returns a
     * refresh token we can use to mint access tokens when booking appointments.
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')
            ->scopes(self::SCOPES)
            ->with([
                'access_type' => 'offline',
                'prompt' => 'consent',
            ])
            ->redirect();
    }

    /**
     * Handle the OAuth callback and persist the user's Google tokens.
     */
    public function callback(Request $request): RedirectResponse
    {
        if ($request->has('error')) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Google connection was cancelled.')]);

            return to_route('integrations.edit');
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            report($e);

            Inertia::flash('toast', ['type' => 'error', 'message' => __('Could not connect your Google account. Please try again.')]);

            return to_route('integrations.edit');
        }

        // Google presents Calendar access as a separate checkbox on the consent
        // screen. If the user didn't grant it, the token is useless for creating
        // Meet links, so refuse the connection and tell them exactly what to do.
        if (! in_array(self::CALENDAR_SCOPE, $googleUser->approvedScopes ?? [], true)) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Please allow Google Calendar access when connecting so we can create Meet links. Reconnect and tick the calendar permission.'),
            ]);

            return to_route('integrations.edit');
        }

        $user = $request->user();

        $user->google_account_email = $googleUser->getEmail();
        $user->google_access_token = $googleUser->token;
        $user->google_token_expires_at = $googleUser->expiresIn
            ? Carbon::now()->addSeconds($googleUser->expiresIn)
            : null;

        // Google only returns a refresh token on the first consent; keep the
        // existing one if this authorization didn't include a fresh token.
        if (filled($googleUser->refreshToken)) {
            $user->google_refresh_token = $googleUser->refreshToken;
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Google account connected.')]);

        return to_route('integrations.edit');
    }

    /**
     * Disconnect the user's Google account.
     */
    public function disconnect(Request $request): RedirectResponse
    {
        $request->user()->update([
            'google_account_email' => null,
            'google_access_token' => null,
            'google_refresh_token' => null,
            'google_token_expires_at' => null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Google account disconnected.')]);

        return to_route('integrations.edit');
    }
}
