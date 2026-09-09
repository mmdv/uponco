import { WifiOff } from 'lucide-react';

import { useOnline } from '@/hooks/use-online';
import { useTranslation } from '@/hooks/use-translation';

/**
 * A slim bar shown across the app while the browser is offline, so it is always
 * clear the data on screen is the last-known cached copy. Renders nothing while
 * online.
 */
export default function OfflineBanner() {
    const isOnline = useOnline();
    const { t } = useTranslation('nav');

    if (isOnline) {
        return null;
    }

    return (
        <div
            role="status"
            className="flex items-center justify-center gap-2 bg-muted px-4 py-1.5 text-xs font-medium text-foreground"
        >
            <WifiOff className="size-3.5" aria-hidden="true" />
            {t('offline.banner')}
        </div>
    );
}
