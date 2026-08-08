<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PushNotificationController extends Controller
{
    /**
     * Show the notification settings page.
     *
     * The VAPID public key is handed to the browser so it can create a push
     * subscription tied to this application; it is public by design and safe to
     * expose. The device list is only used to tell the user how many of their
     * devices are currently set up.
     */
    public function edit(Request $request): Response
    {
        $devices = $request->user()->pushSubscriptions()
            ->latest()
            ->get()
            ->map(fn ($subscription): array => [
                'id' => $subscription->id,
                'endpoint' => $subscription->endpoint,
                'created_at' => $subscription->created_at?->toIso8601String(),
            ])
            ->all();

        return Inertia::render('settings/push-notifications', [
            'vapidPublicKey' => config('webpush.vapid.public_key'),
            'devices' => $devices,
        ]);
    }

    /**
     * Store (or refresh) the push subscription for the calling device.
     *
     * The browser sends the raw `PushSubscription` JSON, whose keys live under a
     * nested `keys` object. Re-posting an endpoint updates the existing row, so
     * a device that re-subscribes never accumulates duplicates.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'endpoint' => ['required', 'string', 'max:500'],
            'keys.p256dh' => ['required', 'string'],
            'keys.auth' => ['required', 'string'],
            'contentEncoding' => ['nullable', 'string', 'in:aesgcm,aes128gcm'],
        ]);

        $request->user()->updatePushSubscription(
            $data['endpoint'],
            $data['keys']['p256dh'],
            $data['keys']['auth'],
            $data['contentEncoding'] ?? null,
        );

        return response()->json(['status' => 'subscribed']);
    }

    /**
     * Forget the push subscription for the calling device.
     */
    public function destroy(Request $request): JsonResponse
    {
        $data = $request->validate([
            'endpoint' => ['required', 'string', 'max:500'],
        ]);

        $request->user()->deletePushSubscription($data['endpoint']);

        return response()->json(['status' => 'unsubscribed']);
    }
}
