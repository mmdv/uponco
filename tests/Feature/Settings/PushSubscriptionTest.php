<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * A browser's `PushSubscription.toJSON()` payload.
 *
 * @return array<string, mixed>
 */
function pushSubscriptionPayload(string $endpoint = 'https://push.example.com/device-a'): array
{
    return [
        'endpoint' => $endpoint,
        'expirationTime' => null,
        'keys' => [
            'p256dh' => 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM=',
            'auth' => 'tBHItJI5svbpez7KI4CCXg==',
        ],
    ];
}

test('the notification settings page exposes the vapid public key', function () {
    config()->set('webpush.vapid.public_key', 'test-public-key');

    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->get(route('notifications.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/notifications')
            ->where('vapidPublicKey', 'test-public-key')
            ->has('devices', 0),
        );
});

test('a device can subscribe to push notifications', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->postJson(route('notifications.subscription.store'), pushSubscriptionPayload())
        ->assertOk();

    expect($user->pushSubscriptions()->count())->toBe(1);

    $subscription = $user->pushSubscriptions()->first();

    expect($subscription->endpoint)->toBe('https://push.example.com/device-a');
    expect($subscription->auth_token)->toBe('tBHItJI5svbpez7KI4CCXg==');
});

test('re-subscribing the same device updates the existing subscription', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('notifications.subscription.store'), pushSubscriptionPayload())
        ->assertOk();

    $payload = pushSubscriptionPayload();
    $payload['keys']['auth'] = 'a-rotated-auth-token';

    $this->actingAs($user)
        ->postJson(route('notifications.subscription.store'), $payload)
        ->assertOk();

    expect($user->pushSubscriptions()->count())->toBe(1);
    expect($user->pushSubscriptions()->first()->auth_token)->toBe('a-rotated-auth-token');
});

test('a user can have several subscribed devices', function () {
    $user = User::factory()->create();

    foreach (['device-a', 'device-b'] as $device) {
        $this->actingAs($user)
            ->postJson(
                route('notifications.subscription.store'),
                pushSubscriptionPayload("https://push.example.com/{$device}"),
            )
            ->assertOk();
    }

    expect($user->pushSubscriptions()->count())->toBe(2);

    $this
        ->actingAs($user)
        ->get(route('notifications.edit'))
        ->assertInertia(fn ($page) => $page->has('devices', 2));
});

test('a device can unsubscribe', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('notifications.subscription.store'), pushSubscriptionPayload())
        ->assertOk();

    $this->actingAs($user)
        ->deleteJson(route('notifications.subscription.destroy'), [
            'endpoint' => 'https://push.example.com/device-a',
        ])
        ->assertOk();

    expect($user->pushSubscriptions()->count())->toBe(0);
});

test('unsubscribing leaves another user\'s subscription alone', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $other->updatePushSubscription('https://push.example.com/device-b', 'key', 'token');

    $this->actingAs($user)
        ->postJson(route('notifications.subscription.store'), pushSubscriptionPayload())
        ->assertOk();

    $this->actingAs($user)
        ->deleteJson(route('notifications.subscription.destroy'), [
            'endpoint' => 'https://push.example.com/device-b',
        ])
        ->assertOk();

    expect($other->pushSubscriptions()->count())->toBe(1);
});

test('the subscription payload is validated', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->postJson(route('notifications.subscription.store'), ['endpoint' => 'https://push.example.com/device-a'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['keys.p256dh', 'keys.auth']);
});

test('guests cannot manage push subscriptions', function () {
    // The app only renders JSON errors for `api/*` (see bootstrap/app.php), so
    // an unauthenticated call is bounced to the login page rather than 401'd.
    $this
        ->postJson(route('notifications.subscription.store'), pushSubscriptionPayload())
        ->assertRedirect(route('login'));

    $this
        ->get(route('notifications.edit'))
        ->assertRedirect(route('login'));

    expect(DB::table(config('webpush.table_name'))->count())->toBe(0);
});
