import { router } from '@inertiajs/react';
import { useEffect, useState, useSyncExternalStore } from 'react';

import type { GestureAxis } from '@/lib/pull-to-refresh';
import {
    PULL_THRESHOLD,
    dampenPull,
    resolveGestureAxis,
    shouldRefresh,
} from '@/lib/pull-to-refresh';

export type PullToRefreshState = {
    /** True on touch devices, where the gesture exists at all. */
    enabled: boolean;
    /** Indicator offset in pixels, already damped. */
    distance: number;
    /** True from release until Inertia finishes reloading the page. */
    refreshing: boolean;
    /** True while a finger is driving the pull, so travel can skip easing. */
    dragging: boolean;
};

/** Everything the gesture tracks; `enabled` is answered by the media query. */
type PullState = Omit<PullToRefreshState, 'enabled'>;

const IDLE: PullState = {
    distance: 0,
    refreshing: false,
    dragging: false,
};

const coarsePointer =
    typeof window === 'undefined'
        ? undefined
        : window.matchMedia('(pointer: coarse)');

function subscribeToPointer(callback: () => void): () => void {
    coarsePointer?.addEventListener('change', callback);

    return () => coarsePointer?.removeEventListener('change', callback);
}

const hasCoarsePointer = (): boolean => coarsePointer?.matches ?? false;

/** No gesture during SSR, and none until the client has said otherwise. */
const noCoarsePointer = (): boolean => false;

/**
 * Drives a pull-to-refresh gesture for the whole app.
 *
 * The app scrolls inside `#app` rather than the window, and that container sets
 * `overscroll-behavior-y: none` — so neither the iOS rubber band nor Chrome's
 * built-in pull-to-refresh is available to us and an installed PWA has no way
 * to reload a page at all. This listens on the scroll container itself and
 * reloads the current Inertia page when a pull from the very top is released
 * past {@link PULL_THRESHOLD}.
 *
 * The gesture yields to anything that has a better claim on the touch: an open
 * dialog or drawer (which locks body scrolling), a nested scroller the user has
 * already moved, and horizontal swipes.
 */
export function usePullToRefresh(): PullToRefreshState {
    const [state, setState] = useState<PullState>(IDLE);
    const enabled = useSyncExternalStore(
        subscribeToPointer,
        hasCoarsePointer,
        noCoarsePointer,
    );

    useEffect(() => {
        const container = enabled ? document.getElementById('app') : null;

        if (!container) {
            return;
        }

        /** Null whenever no gesture is in flight. */
        let origin: { x: number; y: number } | null = null;
        let axis: GestureAxis = 'undecided';
        let distance = 0;
        let reloading = false;

        /**
         * True when the touch landed inside a scroller that is already scrolled
         * down — there the pull belongs to that element, not to the page.
         */
        const startedInsideScrolledElement = (target: EventTarget | null) => {
            let node = target instanceof Element ? target : null;

            while (node && node !== container) {
                if (node.scrollTop > 0) {
                    return true;
                }

                node = node.parentElement;
            }

            return false;
        };

        const settle = (next: Partial<PullState>) =>
            setState((current) => ({ ...current, ...next }));

        const onTouchStart = (event: TouchEvent) => {
            origin = null;

            if (reloading || event.touches.length !== 1) {
                return;
            }

            // Radix and Vaul lock body scrolling behind every dialog, sheet and
            // drawer; a pull inside one of those is the overlay's to handle.
            if (
                document.body.hasAttribute('data-scroll-locked') ||
                container.scrollTop > 0 ||
                startedInsideScrolledElement(event.target)
            ) {
                return;
            }

            const touch = event.touches[0];

            origin = { x: touch.clientX, y: touch.clientY };
            axis = 'undecided';
            distance = 0;
        };

        const onTouchMove = (event: TouchEvent) => {
            if (!origin || axis === 'abandoned') {
                return;
            }

            const touch = event.touches[0];
            const deltaY = touch.clientY - origin.y;
            const deltaX = touch.clientX - origin.x;

            if (axis === 'undecided') {
                axis = resolveGestureAxis(deltaX, deltaY);

                if (axis !== 'vertical') {
                    return;
                }
            }

            // The container can only have scrolled if something else moved it.
            if (deltaY <= 0 || container.scrollTop > 0) {
                origin = null;
                distance = 0;
                settle({ distance: 0, dragging: false });

                return;
            }

            // Owning the gesture keeps the container still and, in a browser
            // tab, suppresses Chrome's own pull-to-refresh on top of ours.
            event.preventDefault();

            distance = dampenPull(deltaY);
            settle({ distance, dragging: true });
        };

        const onTouchEnd = () => {
            if (!origin || axis !== 'vertical') {
                origin = null;

                return;
            }

            origin = null;

            if (!shouldRefresh(distance)) {
                distance = 0;
                settle({ distance: 0, dragging: false });

                return;
            }

            reloading = true;
            distance = 0;
            // Park the indicator at the threshold for as long as the reload
            // runs, so the spinner has somewhere to sit.
            settle({
                distance: PULL_THRESHOLD,
                dragging: false,
                refreshing: true,
            });

            router.reload({
                onFinish: () => {
                    reloading = false;
                    settle({ distance: 0, refreshing: false });
                },
            });
        };

        container.addEventListener('touchstart', onTouchStart, {
            passive: true,
        });
        container.addEventListener('touchmove', onTouchMove, {
            passive: false,
        });
        container.addEventListener('touchend', onTouchEnd, { passive: true });
        container.addEventListener('touchcancel', onTouchEnd, {
            passive: true,
        });

        return () => {
            container.removeEventListener('touchstart', onTouchStart);
            container.removeEventListener('touchmove', onTouchMove);
            container.removeEventListener('touchend', onTouchEnd);
            container.removeEventListener('touchcancel', onTouchEnd);
        };
    }, [enabled]);

    return { enabled, ...state };
}
