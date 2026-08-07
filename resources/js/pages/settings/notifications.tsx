import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import PushNotificationCard from '@/components/notifications/push-notification-card';
import { useTranslation } from '@/hooks/use-translation';
import { edit } from '@/routes/notifications';

type PushDevice = {
    id: number;
    endpoint: string;
    created_at: string | null;
};

export default function Notifications({
    vapidPublicKey,
    devices,
}: {
    vapidPublicKey: string;
    devices: PushDevice[];
}) {
    const { t } = useTranslation('settings');

    return (
        <>
            <Head title={t('notifications.title')} />

            <h1 className="sr-only">{t('notifications.title')}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('notifications.pushTitle')}
                    description={t('notifications.pushDescription')}
                />

                <PushNotificationCard
                    vapidPublicKey={vapidPublicKey}
                    deviceCount={devices.length}
                />
            </div>
        </>
    );
}

Notifications.layout = {
    breadcrumbs: [
        {
            title: 'Notifications',
            href: edit(),
        },
    ],
};
