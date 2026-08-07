import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import {
    currentSubscription,
    isIos,
    isStandalone,
    pushSupported,
    subscribeToPush,
    syncPushSubscription,
    unsubscribeFromPush,
} from '@/lib/push';

type PushEnvironment = {
    supported: boolean;
    standalone: boolean;
    ios: boolean;
    permission: NotificationPermission | null;
};

/**
 * What the browser can do never changes while the page is open, so the snapshot
 * is computed once and then handed back by reference — `useSyncExternalStore`
 * requires a stable value, and rebuilding the object would loop forever.
 */
let cachedEnvironment: PushEnvironment | null = null;

const readEnvironment = (): PushEnvironment => {
    cachedEnvironment ??= {
        supported: pushSupported(),
        standalone: isStandalone(),
        ios: isIos(),
        permission: pushSupported() ? Notification.permission : null,
    };

    return cachedEnvironment;
};

/** None of these APIs exist while rendering on the server. */
const serverEnvironment: PushEnvironment = {
    supported: false,
    standalone: false,
    ios: false,
    permission: null,
};

const neverChanges = () => () => undefined;

export type PushStatus = {
    /** Web Push is usable in this browser as it is currently being run. */
    supported: boolean;
    /** The app is running as an installed PWA rather than a browser tab. */
    standalone: boolean;
    /** iOS/iPadOS, where installing to the Home Screen is a hard requirement. */
    ios: boolean;
    /** The browser's notification permission, or `null` before it is known. */
    permission: NotificationPermission | null;
    /** This device currently has a push subscription. */
    subscribed: boolean;
    /** A subscribe/unsubscribe request is in flight. */
    busy: boolean;
    /** True when the last enable or disable attempt failed. */
    failed: boolean;
    enable: () => Promise<void>;
    disable: () => Promise<void>;
};

/**
 * Drives the notification toggle on the settings page.
 *
 * `enable` must be called directly from a click handler — iOS only shows the
 * permission prompt while it is handling a user gesture.
 */
export function usePushNotifications(vapidPublicKey: string): PushStatus {
    const environment = useSyncExternalStore(
        neverChanges,
        readEnvironment,
        () => serverEnvironment,
    );

    // Granting permission is the one thing that changes the snapshot, so the
    // fresh value is tracked separately rather than invalidating the cache.
    const [grantedPermission, setGrantedPermission] =
        useState<NotificationPermission | null>(null);
    const [subscribed, setSubscribed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!environment.supported) {
            return;
        }

        let cancelled = false;

        void currentSubscription().then((subscription) => {
            if (cancelled) {
                return;
            }

            setSubscribed(subscription !== null);

            // Push services rotate endpoints, and the service worker cannot
            // post the replacement itself, so re-send it whenever this page is
            // opened. Failure here is silent — it is only a refresh.
            if (subscription) {
                void syncPushSubscription().catch(() => undefined);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [environment.supported]);

    const enable = useCallback(async () => {
        setBusy(true);
        setFailed(false);

        try {
            await subscribeToPush(vapidPublicKey);
            setSubscribed(true);
        } catch {
            setFailed(true);
        } finally {
            setGrantedPermission(
                pushSupported() ? Notification.permission : null,
            );
            setBusy(false);
        }
    }, [vapidPublicKey]);

    const disable = useCallback(async () => {
        setBusy(true);
        setFailed(false);

        try {
            await unsubscribeFromPush();
            setSubscribed(false);
        } catch {
            setFailed(true);
        } finally {
            setBusy(false);
        }
    }, []);

    return {
        supported: environment.supported,
        standalone: environment.standalone,
        ios: environment.ios,
        permission: grantedPermission ?? environment.permission,
        subscribed,
        busy,
        failed,
        enable,
        disable,
    };
}
