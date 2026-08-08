import { Head, router, usePage } from '@inertiajs/react';
import { BellOff } from 'lucide-react';

import Heading from '@/components/heading';
import NotificationItem from '@/components/notifications/notification-item';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { useTranslation } from '@/hooks/use-translation';
import { index as notificationsIndex } from '@/routes/notifications';
import type { Paginated } from '@/types';
import type { AppNotification } from '@/types/notifications';

type Props = {
    notifications: Paginated<AppNotification>;
};

export default function NotificationsIndex({ notifications }: Props) {
    const { t } = useTranslation('notifications');
    const { auth } = usePage().props;

    const goToPage = (page: number) => {
        router.reload({
            only: ['notifications'],
            data: { page },
            replace: true,
        });
    };

    return (
        <>
            <Head title={t('title')} />

            <div className="flex flex-col space-y-6 p-4">
                <Heading
                    variant="small"
                    title={t('title')}
                    description={t('description')}
                />

                {notifications.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-16 text-center">
                        <BellOff className="size-8 text-muted-foreground" />
                        <p className="text-sm font-medium">{t('empty')}</p>
                        <p className="text-sm text-muted-foreground">
                            {t('emptyHint')}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y rounded-lg border">
                        {notifications.data.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                currentUserId={auth.user.id}
                            />
                        ))}
                    </div>
                )}

                <PaginationControls
                    page={notifications}
                    onPageChange={goToPage}
                    t={t}
                    testPrefix="notifications"
                />
            </div>
        </>
    );
}

NotificationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Notifications',
            href: notificationsIndex(),
        },
    ],
};
