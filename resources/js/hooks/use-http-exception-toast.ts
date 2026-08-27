import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { FALLBACK_LOCALE, translate } from '@/hooks/use-translation';

const TOO_MANY_REQUESTS = 429;

/**
 * The locale the server rendered this document in.
 *
 * This hook runs from the Toaster, which the app shell mounts *beside* the
 * Inertia component rather than inside it, so `usePage` — and therefore
 * `useTranslation` — is unavailable here. The `<html lang>` attribute carries
 * the same locale the page was rendered with (including the public booking
 * page, which resolves the team's language before rendering), and `translate`
 * still lets a locale the visitor picked this session take precedence.
 */
function documentLocale(): string {
    if (typeof document === 'undefined') {
        return FALLBACK_LOCALE;
    }

    return document.documentElement.lang || FALLBACK_LOCALE;
}

/**
 * Turn a rate-limit response into a toast instead of Inertia's error dialog.
 *
 * A response without the `x-inertia` header is not something Inertia can swap
 * into the page, so it falls through to `handleNonInertiaResponse()` and opens
 * a near-fullscreen `<dialog>` containing an iframe of the raw error page. For
 * a 429 that reads as a crash — worst of all on the public booking page, where
 * the visitor has no idea what they did wrong.
 *
 * The `httpException` event is dispatched `cancelable`, and the dialog only
 * opens if nothing cancelled it, so `preventDefault()` is the supported way to
 * take over. Only 429 is intercepted: a 500 genuinely is a crash, and hiding it
 * behind a toast would make it harder to notice, not easier.
 *
 * Client-side validation keeps most visitors from ever reaching a limit; this
 * is the net under the ones who do.
 */
export function useHttpExceptionToast(): void {
    useEffect(() => {
        return router.on('httpException', (event) => {
            const status = (event as CustomEvent).detail?.response?.status;

            if (status !== TOO_MANY_REQUESTS) {
                return;
            }

            event.preventDefault();

            const locale = documentLocale();

            toast.error(translate('errors', 'tooManyRequests.title', locale), {
                description: translate(
                    'errors',
                    'tooManyRequests.description',
                    locale,
                ),
            });
        });
    }, []);
}
