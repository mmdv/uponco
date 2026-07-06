<?php

namespace App\Support\Google;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Talks to the Google Calendar API on behalf of a connected specialist to create
 * a calendar event with a Google Meet conference attached, returning the join link.
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
     * The Calendar API endpoint for creating events on the primary calendar.
     */
    protected const EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

    /**
     * Create a calendar event with a Google Meet conference for the appointment.
     *
     * @return array{meet_url: string, event_id: string}|null
     */
    public function createMeetEvent(User $specialist, Appointment $appointment): ?array
    {
        $accessToken = $this->freshAccessToken($specialist);

        if ($accessToken === null) {
            return null;
        }

        $team = $appointment->team;
        $timezone = $team->timezone ?: config('app.timezone');

        try {
            $response = Http::withToken($accessToken)
                ->post(self::EVENTS_URL.'?conferenceDataVersion=1', [
                    'summary' => $appointment->service->title.' · '.$team->name,
                    'description' => $appointment->notes ?: '',
                    'start' => [
                        'dateTime' => $appointment->start_at->copy()->setTimezone($timezone)->toRfc3339String(),
                        'timeZone' => $timezone,
                    ],
                    'end' => [
                        'dateTime' => $appointment->end_at->copy()->setTimezone($timezone)->toRfc3339String(),
                        'timeZone' => $timezone,
                    ],
                    'conferenceData' => [
                        'createRequest' => [
                            'requestId' => (string) Str::uuid(),
                            'conferenceSolutionKey' => ['type' => 'hangoutsMeet'],
                        ],
                    ],
                ]);

            if ($response->failed()) {
                report(new \RuntimeException('Google Calendar event creation failed: '.$response->body()));

                return null;
            }

            $meetUrl = $this->extractMeetUrl($response->json());
            $eventId = $response->json('id');

            if ($meetUrl === null || $eventId === null) {
                return null;
            }

            return ['meet_url' => $meetUrl, 'event_id' => $eventId];
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

    /**
     * Pull the Meet join URL out of a Calendar event response.
     *
     * @param  array<string, mixed>|null  $event
     */
    protected function extractMeetUrl(?array $event): ?string
    {
        if (! is_array($event)) {
            return null;
        }

        if (! empty($event['hangoutLink'])) {
            return $event['hangoutLink'];
        }

        foreach ($event['conferenceData']['entryPoints'] ?? [] as $entryPoint) {
            if (($entryPoint['entryPointType'] ?? null) === 'video' && ! empty($entryPoint['uri'])) {
                return $entryPoint['uri'];
            }
        }

        return null;
    }
}
