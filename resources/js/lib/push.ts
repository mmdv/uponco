/**
 * Web Push plumbing for the installed PWA.
 *
 * On iOS this only works once the app has been added to the Home Screen: a
 * regular Safari tab exposes no `PushManager` at all. Everything here therefore
 * degrades quietly rather than throwing, so the settings page can explain the
 * situation instead of showing a broken toggle.
 */

const SUBSCRIPTION_URL = '/settings/notifications/subscription';

/** Is Web Push usable in this browser, right now, as it is being run? */
export const pushSupported = (): boolean =>
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

/**
 * Is the app running as an installed PWA rather than in a browser tab? iOS only
 * grants push in this mode, and `navigator.standalone` is its legacy signal.
 */
export const isStandalone = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }

    const legacyStandalone = (navigator as Navigator & { standalone?: boolean })
        .standalone;

    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        legacyStandalone === true
    );
};

/** Rough check for iOS/iPadOS, used only to tailor the "add to Home Screen" hint. */
export const isIos = (): boolean =>
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        // iPadOS reports itself as a Mac, but a Mac never has a touch screen.
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

/** Register the push service worker. Safe to call on every page load. */
export const registerServiceWorker = (): void => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return;
    }

    navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch(() => undefined);
};

/**
 * The VAPID public key is base64url-encoded; `pushManager.subscribe` wants the
 * raw bytes.
 */
const urlBase64ToUint8Array = (base64: string): Uint8Array<ArrayBuffer> => {
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const normalised = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(normalised);
    const output = new Uint8Array(new ArrayBuffer(raw.length));

    for (let i = 0; i < raw.length; i += 1) {
        output[i] = raw.charCodeAt(i);
    }

    return output;
};

const xsrfToken = (): string => {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);

    return match ? decodeURIComponent(match[1]) : '';
};

/**
 * These are plain JSON endpoints rather than Inertia visits, so they are called
 * with `fetch` and the CSRF token Laravel puts in the `XSRF-TOKEN` cookie.
 */
const send = async (
    method: 'POST' | 'DELETE',
    body: unknown,
): Promise<void> => {
    const response = await fetch(SUBSCRIPTION_URL, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-XSRF-TOKEN': xsrfToken(),
        },
        credentials: 'same-origin',
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(
            `Push subscription request failed with status ${response.status}.`,
        );
    }

    // An expired session redirects to the login page, which `fetch` follows and
    // reports as a perfectly successful HTML response. Insist on the JSON the
    // endpoint actually returns so that never looks like a saved subscription.
    if (!response.headers.get('content-type')?.includes('application/json')) {
        throw new Error(
            'Push subscription request did not reach the application.',
        );
    }
};

/** The device's current push subscription, if it already has one. */
export const currentSubscription =
    async (): Promise<PushSubscription | null> => {
        if (!pushSupported()) {
            return null;
        }

        const registration = await navigator.serviceWorker.ready;

        return registration.pushManager.getSubscription();
    };

/**
 * Ask for permission and subscribe this device.
 *
 * Must be called straight from a click handler: iOS only shows the permission
 * prompt while a user gesture is being handled.
 */
export const subscribeToPush = async (
    vapidPublicKey: string,
): Promise<void> => {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
        throw new Error('Notification permission was not granted.');
    }

    const registration = await navigator.serviceWorker.ready;

    const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }));

    await send('POST', subscription.toJSON());
};

/** Unsubscribe this device and forget it server-side. */
export const unsubscribeFromPush = async (): Promise<void> => {
    const subscription = await currentSubscription();

    if (!subscription) {
        return;
    }

    const { endpoint } = subscription;

    await subscription.unsubscribe();
    await send('DELETE', { endpoint });
};

/**
 * Re-send the device's subscription so the server always holds the current
 * endpoint. Push services rotate endpoints and the service worker cannot post
 * the new one itself, so this runs whenever the settings page is opened.
 */
export const syncPushSubscription = async (): Promise<void> => {
    const subscription = await currentSubscription();

    if (!subscription) {
        return;
    }

    await send('POST', subscription.toJSON());
};
