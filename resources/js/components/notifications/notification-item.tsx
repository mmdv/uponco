import { formatDistanceToNow } from 'date-fns';
import { CalendarClock, CalendarPlus, CalendarX } from 'lucide-react';

import { useLocale, useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { AppNotification, NotificationAlert } from '@/types/notifications';

type Props = {
    notification: AppNotification;
    /** The signed-in user, so a manager can see whose appointment this is. */
    currentUserId: number;
};

const alertIcons: Record<NotificationAlert, typeof CalendarPlus> = {
    booked: CalendarPlus,
    rescheduled: CalendarClock,
    cancelled: CalendarX,
};

const alertStyles: Record<NotificationAlert, string> = {
    booked: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    rescheduled: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    cancelled: 'bg-destructive/10 text-destructive-foreground',
};

/**
 * One row in the notification drawer or on the notifications page.
 *
 * Everything comes from the stored payload rather than a live lookup, so a
 * booking whose service was deleted afterwards still reads sensibly.
 */
export default function NotificationItem({
    notification,
    currentUserId,
}: Props) {
    const { t } = useTranslation('notifications');
    const { locale } = useLocale();

    const Icon = alertIcons[notification.alert] ?? CalendarPlus;

    const start = new Date(notification.start_at);

    // Pass the locale explicitly: left to the runtime default this resolves
    // differently under SSR (Node) than in the browser, which hydrates as a
    // text mismatch.
    const when = start.toLocaleString(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: notification.timezone,
    });

    const service = notification.service_title ?? t('unknownService');
    const customer = notification.customer_name ?? t('unknownCustomer');

    // Managers get notifications about other people's appointments, so name the
    // specialist unless it is the reader's own booking.
    const showSpecialist = notification.specialist_id !== currentUserId;

    return (
        <div
            className={cn(
                'flex gap-3 rounded-lg p-3 transition-colors',
                !notification.read && 'bg-accent/60',
            )}
            data-test="notification-item"
            data-read={notification.read}
        >
            <span
                className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full',
                    alertStyles[notification.alert],
                )}
            >
                <Icon className="size-4" />
            </span>

            <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-medium">
                    {t(`alert.${notification.alert}`)}
                    {showSpecialist && (
                        <span className="font-normal text-muted-foreground">
                            {' '}
                            {t('forSpecialist', {
                                name: notification.specialist_name,
                            })}
                        </span>
                    )}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                    {customer} · {service}
                </p>
                {/* "3 minutes ago" is measured against the clock of whoever
                    rendered it, so the server and the browser will disagree by
                    construction. The client value is the correct one and wins
                    on hydration; the warning is the only thing suppressed. */}
                <p
                    className="text-xs text-muted-foreground"
                    suppressHydrationWarning
                >
                    {when}
                    {notification.created_at && (
                        <>
                            {' · '}
                            {formatDistanceToNow(
                                new Date(notification.created_at),
                                { addSuffix: true },
                            )}
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
