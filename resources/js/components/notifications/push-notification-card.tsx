import { BellOff, Smartphone } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useTranslation } from '@/hooks/use-translation';

type Props = {
    vapidPublicKey: string;
    deviceCount: number;
};

/**
 * Toggle that subscribes this device to booking push notifications.
 *
 * Push is only reachable on iPhone once the app has been added to the Home
 * Screen, so the states where the toggle cannot work explain why instead of
 * showing a control that silently does nothing.
 */
export default function PushNotificationCard({
    vapidPublicKey,
    deviceCount,
}: Props) {
    const { t } = useTranslation('settings');
    const {
        supported,
        standalone,
        ios,
        permission,
        subscribed,
        busy,
        failed,
        enable,
        disable,
    } = usePushNotifications(vapidPublicKey);

    // iOS exposes no PushManager in a normal Safari tab, so "unsupported" there
    // really means "not installed yet" — a fixable situation worth explaining.
    if (!supported && !standalone) {
        return (
            <Alert data-test="push-install-hint">
                <Smartphone />
                <AlertTitle>{t('pushNotifications.installTitle')}</AlertTitle>
                <AlertDescription>
                    {ios
                        ? t('pushNotifications.installIos')
                        : t('pushNotifications.installOther')}
                </AlertDescription>
            </Alert>
        );
    }

    if (!supported) {
        return (
            <Alert data-test="push-unsupported">
                <BellOff />
                <AlertTitle>
                    {t('pushNotifications.unsupportedTitle')}
                </AlertTitle>
                <AlertDescription>
                    {t('pushNotifications.unsupportedDescription')}
                </AlertDescription>
            </Alert>
        );
    }

    if (permission === 'denied') {
        return (
            <Alert data-test="push-denied">
                <BellOff />
                <AlertTitle>{t('pushNotifications.deniedTitle')}</AlertTitle>
                <AlertDescription>
                    {t('pushNotifications.deniedDescription')}
                </AlertDescription>
            </Alert>
        );
    }

    // The server-rendered count is a page-load snapshot; once this device has
    // toggled, reflect that immediately rather than waiting for a reload.
    const devices = subscribed ? Math.max(deviceCount, 1) : deviceCount;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5 pr-4">
                    <p className="text-sm font-medium">
                        {subscribed
                            ? t('pushNotifications.enabled')
                            : t('pushNotifications.disabled')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {subscribed
                            ? t('pushNotifications.enabledHint')
                            : t('pushNotifications.disabledHint')}
                    </p>
                </div>

                <Switch
                    checked={subscribed}
                    disabled={busy}
                    onCheckedChange={() =>
                        void (subscribed ? disable() : enable())
                    }
                    aria-label={t('pushNotifications.pushTitle')}
                    data-test="push-toggle"
                />
            </div>

            {devices > 0 && (
                <p
                    className="text-sm text-muted-foreground"
                    data-test="push-device-count"
                >
                    {devices === 1
                        ? t('pushNotifications.deviceCountOne')
                        : t('pushNotifications.deviceCountOther', {
                              count: devices,
                          })}
                </p>
            )}

            {failed && (
                <p
                    className="text-sm text-destructive-foreground"
                    data-test="push-error"
                >
                    {t('pushNotifications.failed')}
                </p>
            )}
        </div>
    );
}
