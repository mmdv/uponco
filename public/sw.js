/**
 * Uponco service worker.
 *
 * Push-only on purpose: it registers no `fetch` handler and caches nothing, so
 * it cannot interfere with asset delivery or Inertia navigation. Its single job
 * is to receive Web Push messages while the app is closed and turn them into
 * notifications — which is what lets the installed iOS PWA notify a specialist
 * about a new booking.
 */

// Take over immediately so a freshly installed worker can receive pushes
// without the user closing and reopening the app first.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

/**
 * Read the push payload. The Laravel webpush channel sends the notification
 * options under a top-level `data` key.
 */
const readPayload = (event) => {
    if (!event.data) {
        return null;
    }

    try {
        const payload = event.data.json();

        return payload.data ?? payload;
    } catch {
        return { title: event.data.text() };
    }
};

self.addEventListener('push', (event) => {
    const payload = readPayload(event);

    if (!payload || !payload.title) {
        return;
    }

    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: payload.icon,
            badge: payload.badge,
            tag: payload.tag,
            data: payload.data ?? {},
        }),
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = event.notification.data?.url ?? '/';

    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Reuse an already open window where possible — on iOS opening a
                // second one would leave the user with a stray PWA instance.
                for (const client of clientList) {
                    if ('focus' in client) {
                        return client.focus().then((focused) =>
                            'navigate' in focused ? focused.navigate(url) : focused,
                        );
                    }
                }

                return self.clients.openWindow(url);
            }),
    );
});

/**
 * Push services rotate endpoints occasionally. Re-subscribe with the same VAPID
 * key so the device keeps a valid subscription; the new endpoint is sent to the
 * server by `syncPushSubscription()` the next time the app is opened. The worker
 * cannot post it itself — it has no CSRF token, and exempting the endpoint from
 * CSRF would let a third-party page attach its own device to a signed-in user.
 */
self.addEventListener('pushsubscriptionchange', (event) => {
    const applicationServerKey = event.oldSubscription?.options?.applicationServerKey;

    if (!applicationServerKey) {
        return;
    }

    event.waitUntil(
        self.registration.pushManager
            .subscribe({ userVisibleOnly: true, applicationServerKey })
            .catch(() => undefined),
    );
});
