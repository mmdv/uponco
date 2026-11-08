<?php

namespace App\Notifications\Channels;

use App\Models\DevicePushToken;
use App\Models\User;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Sends a notification to the user's mobile app installs via Expo's push
 * service, which forwards it to APNs / FCM.
 *
 * A notification opts in by implementing `toExpoPush()`, returning the
 * title, body and data the app receives.
 */
class ExpoPushChannel
{
    public const SEND_URL = 'https://exp.host/--/api/v2/push/send';

    /**
     * Send the given notification.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        if (! $notifiable instanceof User || ! method_exists($notification, 'toExpoPush')) {
            return;
        }

        $tokens = $notifiable->devicePushTokens()->pluck('token');

        if ($tokens->isEmpty()) {
            return;
        }

        /** @var array{title: string, body: string, data?: array<string, mixed>} $message */
        $message = $notification->toExpoPush($notifiable);

        $messages = $tokens->map(fn (string $token): array => [
            'to' => $token,
            'sound' => 'default',
            ...$message,
        ])->all();

        $response = Http::acceptJson()
            ->timeout(15)
            ->when(config('services.expo.access_token'), fn ($request, string $accessToken) => $request->withToken($accessToken))
            ->post(self::SEND_URL, $messages);

        if (! $response->successful()) {
            report(new RuntimeException('Expo push failed: '.$response->status().' '.$response->body()));

            return;
        }

        $this->forgetUnregisteredDevices($tokens->all(), $response->json('data', []));
    }

    /**
     * Expo answers with one ticket per message, in order. A device that has
     * uninstalled the app reports `DeviceNotRegistered`; drop its token so we
     * stop sending to it.
     *
     * @param  list<string>  $tokens
     * @param  array<int, array<string, mixed>>  $tickets
     */
    protected function forgetUnregisteredDevices(array $tokens, array $tickets): void
    {
        $unregistered = collect($tickets)
            ->filter(fn (array $ticket): bool => ($ticket['details']['error'] ?? null) === 'DeviceNotRegistered')
            ->keys()
            ->map(fn (int $index): ?string => $tokens[$index] ?? null)
            ->filter()
            ->all();

        if ($unregistered !== []) {
            DevicePushToken::whereIn('token', $unregistered)->delete();
        }
    }
}
