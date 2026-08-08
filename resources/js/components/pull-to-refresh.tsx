import { RefreshCw } from 'lucide-react';

import { Spinner } from '@/components/ui/spinner';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { FALLBACK_LOCALE, translate } from '@/hooks/use-translation';
import { pullProgress } from '@/lib/pull-to-refresh';
import { cn } from '@/lib/utils';

/**
 * The locale the document was rendered with. This component is mounted beside
 * the Inertia app rather than inside it, so `usePage` — and with it the
 * `useTranslation` hook — is out of reach; `<html lang>` carries the same
 * locale and `setLocale` keeps it current.
 */
function documentLocale(): string {
    if (typeof document === 'undefined') {
        return FALLBACK_LOCALE;
    }

    return document.documentElement.lang || FALLBACK_LOCALE;
}

/**
 * The pull-to-refresh affordance, mounted once for the whole app.
 *
 * A pill that tracks the finger down from the top of the screen: its arrow
 * turns as the pull approaches the threshold, and once released it becomes a
 * spinner until the page has reloaded. Nothing renders on pointer devices,
 * where the gesture doesn't exist.
 */
export default function PullToRefresh() {
    const { enabled, distance, refreshing, dragging } = usePullToRefresh();

    if (!enabled) {
        return null;
    }

    const progress = pullProgress(distance);

    return (
        <div
            className="safe-area-inset-top pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center"
            aria-hidden={!refreshing}
        >
            <div
                role="status"
                aria-label={
                    refreshing
                        ? translate('nav', 'pullToRefresh', documentLocale())
                        : undefined
                }
                className={cn(
                    'flex size-10 items-center justify-center rounded-full border border-black/[0.08] bg-card text-primary shadow-soft dark:border-border',
                    !dragging && 'transition-all duration-300 ease-out',
                )}
                style={{
                    // Start tucked above the edge so the pill emerges from it.
                    transform: `translateY(${distance - 52}px)`,
                    opacity: progress,
                }}
            >
                {refreshing ? (
                    <Spinner className="size-5" aria-hidden />
                ) : (
                    <RefreshCw
                        className="size-5"
                        style={{ transform: `rotate(${progress * 270}deg)` }}
                    />
                )}
            </div>
        </div>
    );
}
