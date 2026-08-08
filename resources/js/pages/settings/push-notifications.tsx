import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import PushNotificationCard from '@/components/notifications/push-notification-card';
import { useTranslation } from '@/hooks/use-translation';
import { edit } from '@/routes/push-notifications';

type PushDevice = {
    id: number;
    endpoint: string;
    created_at: string | null;
};

export default function PushNotifications({
    vapidPublicKey,
    devices,
}: {
    vapidPublicKey: string;
    devices: PushDevice[];
}) {
    const { t } = useTranslation('settings');

    return (
        <>
            <Head title={t('pushNotifications.title')} />

            <h1 className="sr-only">{t('pushNotifications.title')}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('pushNotifications.pushTitle')}
                    description={t('pushNotifications.pushDescription')}
                />

                <PushNotificationCard
                    vapidPublicKey={vapidPublicKey}
                    deviceCount={devices.length}
                />
            </div>
        </>
    );
}

PushNotifications.layout = {
    breadcrumbs: [
        {
            title: 'Push notifications',
            href: edit(),
        },
    ],
};
