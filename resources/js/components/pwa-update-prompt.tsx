import { useEffect } from 'react';
import { toast } from 'sonner';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { FALLBACK_LOCALE, translate } from '@/hooks/use-translation';

const UPDATE_TOAST_ID = 'pwa-update';

/**
 * The locale the document was rendered with. Like PullToRefresh, this component
 * is mounted beside the Inertia app rather than inside it, so `usePage` — and
 * with it `useTranslation` — is out of reach; `<html lang>` carries the locale.
 */
function documentLocale(): string {
    if (typeof document === 'undefined') {
        return FALLBACK_LOCALE;
    }

    return document.documentElement.lang || FALLBACK_LOCALE;
}

/**
 * Registers the service worker and, once a newer build has been deployed and
 * its worker is waiting, surfaces a persistent toast prompting the user to
 * reload into it. Renders no DOM of its own, so it is safe to mount beside the
 * Inertia app without a hydration mismatch.
 */
export default function PwaUpdatePrompt() {
    // The worker is registered at `/sw.js` — the same URL the previous
    // push-only worker used — so a returning user's existing registration
    // simply updates to this one; no stale registration to clean up.
    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW();

    useEffect(() => {
        if (!needRefresh) {
            return;
        }

        const locale = documentLocale();

        toast(translate('nav', 'update.title', locale), {
            id: UPDATE_TOAST_ID,
            description: translate('nav', 'update.description', locale),
            duration: Infinity,
            action: {
                label: translate('nav', 'update.action', locale),
                onClick: () => void updateServiceWorker(),
            },
        });
    }, [needRefresh, updateServiceWorker]);

    return null;
}
