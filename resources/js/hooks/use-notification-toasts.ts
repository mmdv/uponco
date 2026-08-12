import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useTranslation } from '@/hooks/use-translation';
import type { AppNotification } from '@/types/notifications';

/**
 * Toast notifications that arrive when the payload changes.
 *
 * Fresh notifications are pulled in on page navigation or pull-to-refresh, not
 * on a timer. The ids already seen are remembered for the session, and the set
 * is seeded from the *first* payload — otherwise every page load would replay
 * the whole unread history as toasts. Only genuinely new arrivals pop up.
 */
export function useNotificationToasts(items: AppNotification[]): void {
    const { t } = useTranslation('notifications');

    const seen = useRef<Set<string> | null>(null);

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
