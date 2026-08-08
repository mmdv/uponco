import { usePoll } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useTranslation } from '@/hooks/use-translation';
import type { AppNotification } from '@/types/notifications';

/** How often the header checks for new notifications. */
const POLL_INTERVAL_MS = 30_000;

/**
 * Poll for new notifications and toast the ones that arrive.
 *
 * The ids already seen are remembered for the session, and the set is seeded
 * from the *first* payload — otherwise every page load would replay the whole
 * unread history as toasts. Only genuinely new arrivals pop up.
 */
export function useNotificationToasts(items: AppNotification[]): void {
    const { t } = useTranslation('notifications');

    const seen = useRef<Set<string> | null>(null);

    usePoll(POLL_INTERVAL_MS, { only: ['notificationBell'] });

    useEffect(() => {
        if (seen.current === null) {
            seen.current = new Set(items.map((item) => item.id));

            return;
        }

        const known = seen.current;

        // Oldest first, so a burst of notifications stacks in the order they
        // actually happened.
        const arrivals = items.filter(
            (item) => !known.has(item.id) && !item.read,
        );

        for (const item of [...arrivals].reverse()) {
            toast(t(`alert.${item.alert}`), {
                description: [
                    item.customer_name ?? t('unknownCustomer'),
                    item.service_title ?? t('unknownService'),
                ].join(' · '),
            });
        }

        for (const item of items) {
            known.add(item.id);
        }
    }, [items, t]);
}
