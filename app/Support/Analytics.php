<?php

namespace App\Support;

use Illuminate\Support\Str;

class Analytics
{
    /**
     * The session key holding events waiting to be captured by the browser.
     *
     * Kept free of dots: the session resolves those as nested array paths.
     */
    private const SESSION_KEY = 'analytics_events';

    /**
     * Queue a product analytics event for the next Inertia page load.
     *
     * Events are flashed to the session rather than sent from PHP so they are
     * captured under the visitor's PostHog identity, which links an anonymous
     * visit to the account it eventually became. Only the browser knows that
     * identity, so the server cannot attribute the event on its own.
     *
     * @param  array<string, mixed>  $properties
     */
    public static function record(string $name, array $properties = []): void
    {
        $events = session()->get(self::SESSION_KEY, []);

        $events[] = [
            'id' => (string) Str::uuid(),
            'name' => $name,
            'properties' => $properties,
        ];

        session()->flash(self::SESSION_KEY, $events);
    }

    /**
     * Get the queued events so they can be shared with the client.
     *
     * @return list<array{id: string, name: string, properties: array<string, mixed>}>
     */
    public static function pending(): array
    {
        return array_values(session()->get(self::SESSION_KEY, []));
    }

    /**
     * Preserve the queued events for one more request.
     *
     * Flash data lives for a single request, but an event is often queued a
     * redirect (or several) before the browser reaches a page that renders it:
     * a fresh sign-up bounces register -> onboarding -> email verification, and
     * only that last page carries the event to the client. Reflashing on each
     * redirect hop keeps the events alive until a page finally renders them,
     * mirroring how Inertia itself carries validation errors across redirects.
     */
    public static function keepForNextRequest(): void
    {
        session()->keep([self::SESSION_KEY]);
    }
}
