/// <reference lib="webworker" />

/**
 * Uponco service worker (injectManifest build via vite-plugin-pwa).
 *
 * Two jobs:
 *   1. Offline support — precache the built app shell and keep the last-known
 *      Dashboard and Appointments responses so they still render with no
 *      network. Everything else falls back to the cached Dashboard shell.
 *   2. Web Push — the original push-only responsibilities are preserved
 *      verbatim so an installed PWA keeps notifying specialists about bookings
 *      while it is closed.
 *
 * Updates are user-driven: this worker never calls `skipWaiting()` on install,
 * so a freshly deployed build waits until the "new version" prompt
 * (components/pwa-update-prompt) posts `SKIP_WAITING`.
 */

import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import type { PrecacheEntry } from 'workbox-precaching';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & {
    __WB_MANIFEST: Array<PrecacheEntry | string>;
};

// --- Offline caching ------------------------------------------------------

/** Precache the hashed build assets so the SPA can boot with no network. */
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

const PAGES_CACHE = 'uponco-pages';

/** The routes whose data must survive offline, matched at the site root. */
const OFFLINE_PAGES = /^\/(dashboard|appointments)\/?$/;

/**
 * A visit to `/dashboard` arrives twice: once as a full-document navigation
 * (reopening the PWA) and once as an Inertia XHR (in-app navigation), each
 * needing a different response body. Keep them as separate cache entries by
 * tagging the Inertia variant on the cache key.
 */
const inertiaVariantPlugin = {
    cacheKeyWillBeUsed: async ({
        request,
    }: {
        request: Request;
    }): Promise<string> => {
        const url = new URL(request.url);

        if (request.headers.get('X-Inertia')) {
            url.searchParams.set('__inertia', '1');
        }

        return url.href;
    },
};

const pageStrategy = new NetworkFirst({
    cacheName: PAGES_CACHE,
    plugins: [
        inertiaVariantPlugin,
        new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
});

// Dashboard and Appointments: serve fresh when online, fall back to the last
// cached copy (document or Inertia JSON) when offline.
registerRoute(
    ({ url, request }) =>
        request.method === 'GET' &&
        url.origin === self.location.origin &&
        OFFLINE_PAGES.test(url.pathname),
    pageStrategy,
);

// Any other page navigation offline (customers, manage, settings…) has no
// cached data. Try the network, and when it fails hand back the cached
// Dashboard shell so reopening the installed PWA always lands somewhere usable
// rather than the browser's offline error.
registerRoute(
    new NavigationRoute(async (options) => {
        try {
            return await pageStrategy.handle(options);
        } catch {
            const cache = await caches.open(PAGES_CACHE);
            const fallback = await cache.match('/dashboard');

            return fallback ?? Response.error();
        }
    }),
);

/** Adopt open tabs as soon as this worker activates (after the user updates). */
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

/** The update prompt reloads into the new build by asking the waiting worker
 * to take over. */
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// --- Web Push (unchanged behaviour) ---------------------------------------

type PushPayload = {
    title?: string;
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown> & { url?: string };
};

/**
 * Read the push payload. The Laravel webpush channel emits the notification
 * options at the top level (`title`, `body`, `icon`, `badge`, `tag`) with the
 * click-through payload nested under a `data` key.
 */
const readPayload = (event: PushEvent): PushPayload | null => {
    if (!event.data) {
        return null;
    }

    try {
        return event.data.json() as PushPayload;
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

    const url =
        (event.notification.data as { url?: string } | undefined)?.url ?? '/';

    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Reuse an already open window where possible — on iOS opening a
                // second one would leave the user with a stray PWA instance.
                for (const client of clientList) {
                    if ('focus' in client) {
                        return client
                            .focus()
                            .then((focused) =>
                                'navigate' in focused
                                    ? focused.navigate(url)
                                    : focused,
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
    const applicationServerKey =
        event.oldSubscription?.options?.applicationServerKey;

    if (!applicationServerKey) {
        return;
    }

    event.waitUntil(
        self.registration.pushManager
            .subscribe({ userVisibleOnly: true, applicationServerKey })
            .catch(() => undefined),
    );
});
