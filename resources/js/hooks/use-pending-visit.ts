import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Tracks the pathname of the visit Inertia is currently loading, or `null`
 * when nothing is in flight. Lets navigation controls (e.g. the bottom nav)
 * show an instant pending state on the tapped destination while the next page
 * is fetched, instead of sitting dead until the swap happens.
 */
export function usePendingVisit(): string | null {
    const [pendingPath, setPendingPath] = useState<string | null>(null);

    useEffect(() => {
        const origin =
            typeof window !== 'undefined'
                ? window.location.origin
                : 'http://localhost';

        const stopStart = router.on('start', (event) => {
            const { url } = event.detail.visit;

            setPendingPath(new URL(url, origin).pathname);
        });

        const stopFinish = router.on('finish', () => {
            setPendingPath(null);
        });

        return () => {
            stopStart();
            stopFinish();
        };
    }, []);

    return pendingPath;
}
