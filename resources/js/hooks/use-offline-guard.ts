import { toast } from 'sonner';

import { useOnline } from '@/hooks/use-online';
import { useTranslation } from '@/hooks/use-translation';

export type OfflineGuard = {
    /** `true` while the browser reports a network connection. */
    isOnline: boolean;
    /**
     * Call at the top of a write handler. When offline it shows a toast and
     * returns `true` so the caller can early-return; otherwise returns `false`.
     */
    blockWhenOffline: () => boolean;
};

/**
 * Shared gate for the write actions on the pages that stay usable offline
 * (Dashboard, Appointments). Offline these show only cached data, so creating,
 * cancelling or rescheduling must be prevented rather than fired at a network
 * that isn't there.
 */
export function useOfflineGuard(): OfflineGuard {
    const isOnline = useOnline();
    const { t } = useTranslation('nav');

    const blockWhenOffline = (): boolean => {
        if (isOnline) {
            return false;
        }

        toast.error(t('offline.writeBlocked'));

        return true;
    };

    return { isOnline, blockWhenOffline };
}
