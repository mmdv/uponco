import { PushNotificationCard } from 'uponco';

const VAPID_KEY = 'BFq3Kx8mJ0oQ4Y2n7hRZ0sV1cWpT6yLb9dUeA3gHnMk';

/*
    Which branch this card takes is decided by the browser, not by props: it
    reads `Notification.permission` once, on first render. The capture browser
    reports `denied`, which would pin every cell to the "notifications are
    blocked" alert. Reporting the ordinary `default` instead — before the bundle
    reads it — lets the preview show the toggle, which is the state the settings
    page is actually built around.
*/
if (typeof window !== 'undefined' && 'Notification' in window) {
    Object.defineProperty(window.Notification, 'permission', {
        configurable: true,
        get: () => 'default',
    });
}

/** The push toggle on Settings → Notifications, before this device opts in. */
export function Default() {
    return (
        <div className="max-w-lg">
            <PushNotificationCard vapidPublicKey={VAPID_KEY} deviceCount={0} />
        </div>
    );
}

/** Other devices are already subscribed, so the count is shown underneath. */
export function WithSubscribedDevices() {
    return (
        <div className="max-w-lg">
            <PushNotificationCard vapidPublicKey={VAPID_KEY} deviceCount={3} />
        </div>
    );
}

/** Inside the settings section it actually sits in. */
export function InSettingsSection() {
    return (
        <div className="max-w-lg space-y-4">
            <div className="space-y-0.5">
                <h3 className="text-base font-semibold">Push notifications</h3>
                <p className="text-sm text-muted-foreground">
                    Get told on this device when an appointment is booked,
                    moved or cancelled.
                </p>
            </div>
            <PushNotificationCard vapidPublicKey={VAPID_KEY} deviceCount={1} />
        </div>
    );
}
