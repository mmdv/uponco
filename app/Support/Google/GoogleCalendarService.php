<?php

namespace App\Support\Google;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;

/**
 * Talks to the Google Meet REST API on behalf of a connected specialist to create
 * a standalone Meet space, returning the join link.
 *
 * A Meet space is created without any calendar event: the link is placed in the
 * confirmation email and .ics attachment, and the customer decides whether to add
 * the appointment to their own calendar.
 *
 * All network failures are reported and surfaced as `null` so a failed Google call
 * can never break the surrounding booking flow.
 */
class GoogleCalendarService
{
    /**
     * Google's OAuth token endpoint.
     */
    protected const TOKEN_URL = 'https://oauth2.googleapis.com/token';

    /**
     * The Meet REST API endpoint for creating meeting spaces.
     */
    protected const SPACES_URL = 'https://meet.googleapis.com/v2/spaces';

    /**
     * Create a standalone Google Meet space for the appointment.
     *
     * @return array{meet_url: string, space_name: string}|null
     */
    public function createMeetSpace(User $specialist, Appointment $appointment): ?array
    {
        $accessToken = $this->freshAccessToken($specialist);

        if ($accessToken === null) {
            return null;
        }

        try {
            $response = Http::withToken($accessToken)
                ->post(self::SPACES_URL, (object) []);

            if ($response->failed()) {
                report(new \RuntimeException('Google Meet space creation failed: '.$response->body()));

                return null;
            }

            $meetUrl = $response->json('meetingUri');
            $spaceName = $response->json('name');

            if ($meetUrl === null || $spaceName === null) {
                return null;
            }

            return ['meet_url' => $meetUrl, 'space_name' => $spaceName];
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }

    /**
     * Return a valid access token for the user, refreshing it first if it has
     * expired. Returns null when the user is not connected or the refresh fails.
     */
    public function freshAccessToken(User $user): ?string
    {
        if (! $user->hasGoogleConnected()) {
            return null;
        }

        if (! $user->googleTokenIsExpired()) {
            return $user->google_access_token;
        }

        try {
            $response = Http::asForm()->post(self::TOKEN_URL, [
                'client_id' => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'refresh_token' => $user->google_refresh_token,
                'grant_type' => 'refresh_token',
            ]);

            if ($response->failed()) {
                report(new \RuntimeException('Google token refresh failed: '.$response->body()));

                return null;
            }

            $accessToken = $response->json('access_token');

            if ($accessToken === null) {
                return null;
            }

            $user->update([
                'google_access_token' => $accessToken,
                'google_token_expires_at' => Carbon::now()->addSeconds((int) $response->json('expires_in', 3600)),
            ]);

            return $accessToken;
        } catch (\Throwable $e) {
            report($e);

            return null;
        }
    }
}
