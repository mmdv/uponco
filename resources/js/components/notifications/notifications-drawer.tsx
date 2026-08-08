import { BellOff } from 'lucide-react';

import NotificationItem from '@/components/notifications/notification-item';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useTranslation } from '@/hooks/use-translation';
import type { AppNotification } from '@/types/notifications';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Closes the drawer and navigates to the full notifications page. */
    onSeeAll: () => void;
    items: AppNotification[];
    currentUserId: number;
};

/**
 * The right-hand drawer behind the header bell, on every breakpoint.
 *
 * It renders the recent items already carried by the shared `notifications`
 * prop, so opening it costs no request.
 */
export default function NotificationsDrawer({
    open,
    onOpenChange,
    onSeeAll,
    items,
    currentUserId,
}: Props) {
    const { t } = useTranslation('notifications');

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
                data-test="notifications-drawer"
            >
                <SheetHeader className="shrink-0 border-b">
                    <SheetTitle>{t('title')}</SheetTitle>
                    <SheetDescription>{t('description')}</SheetDescription>
                </SheetHeader>

                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                            <BellOff className="size-8 text-muted-foreground" />
                            <p className="text-sm font-medium">{t('empty')}</p>
                            <p className="text-sm text-muted-foreground">
                                {t('emptyHint')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {items.map((item) => (
                                <NotificationItem
                                    key={item.id}
                                    notification={item}
                                    currentUserId={currentUserId}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <SheetFooter className="shrink-0 border-t">
                    {/* Deliberately a button rather than a <Link>: the parent
                        navigates and marks read in sequence, because doing both
                        at once lets a partial response land on the new page. */}
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={onSeeAll}
                        data-test="notifications-see-all"
                    >
                        {t('seeAll')}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
