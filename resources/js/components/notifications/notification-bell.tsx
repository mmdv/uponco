import { router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useRef, useState } from 'react';

import NotificationsDrawer from '@/components/notifications/notifications-drawer';
import { Button } from '@/components/ui/button';
import { useNotificationToasts } from '@/hooks/use-notification-toasts';
import { useTranslation } from '@/hooks/use-translation';
import { index as notificationsIndex, read } from '@/routes/notifications';

/** Anything above this is shown as "99+" so the badge keeps its size. */
const MAX_BADGE_COUNT = 99;

/**
 * Header bell: unread badge, right-hand drawer, and the toasts for anything
 * that arrives while the app is open.
 *
 * Closing the drawer marks this user's unread notifications as read. That only
 * ever touches their own rows — a colleague's copy of the same event stays
 * unread until they open their own drawer.
 */
export default function NotificationBell() {
    const { t } = useTranslation('notifications');
    const { notificationBell, auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const markingReadRef = useRef(false);

    const unread = notificationBell?.unread ?? 0;
    const items = notificationBell?.items ?? [];

    useNotificationToasts(items);

    /**
     * Mark this user's notifications as read.
     *
     * `only` keeps the response to the bell's own prop, which means the response
     * must never be applied to a different page than the one that asked for it —
     * a stripped prop set would leave the new page without `auth` and blank the
     * app. Never call this while a navigation is in flight; see `handleSeeAll`.
     */
    const markAllRead = () => {
        // `unread` only drops once the response lands, so toggling the popover
        // quickly can fire this twice for the same notifications.
        if (markingReadRef.current) {
            return;
        }

        markingReadRef.current = true;

        router.post(
            read.url(),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ['notificationBell'],
                onFinish: () => {
                    markingReadRef.current = false;
                },
            },
        );
    };

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (nextOpen || unread === 0) {
            return;
        }

        markAllRead();
    };

    /**
     * "See all" navigates, closes the drawer and marks everything read — all
     * three strictly in that order.
     *
     * Nothing here may overlap the navigation. Marking read mid-flight lets a
     * stripped partial response land on the destination page and blank the app,
     * and closing the sheet mid-flight interrupts its exit animation, which
     * leaves Radix's full-screen overlay mounted and swallowing every click.
     */
    const handleSeeAll = () => {
        router.visit(notificationsIndex().url, {
            onSuccess: () => {
                setOpen(false);

                if (unread > 0) {
                    markAllRead();
                }
            },
        });
    };

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="relative size-9 rounded-full"
                onClick={() => handleOpenChange(true)}
                aria-label={t('title')}
                data-test="notification-bell"
            >
                <Bell className="size-5 opacity-80" />
                {unread > 0 && (
                    <span
                        className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-gradient px-1 text-[10px] leading-none font-semibold text-primary-foreground"
                        data-test="notification-badge"
                    >
                        {unread > MAX_BADGE_COUNT
                            ? `${MAX_BADGE_COUNT}+`
                            : unread}
                    </span>
                )}
            </Button>

            <NotificationsDrawer
                open={open}
                onOpenChange={handleOpenChange}
                onSeeAll={handleSeeAll}
                items={items}
                currentUserId={auth.user.id}
            />
        </>
    );
}
