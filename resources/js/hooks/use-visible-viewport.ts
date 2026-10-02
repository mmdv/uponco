import { useEffect, useState } from 'react';

export type VisibleViewport = { top: number; height: number };

/**
 * Tracks the visible viewport so a mobile full-screen panel can size itself to
 * the area above the on-screen keyboard. Mobile browsers don't shrink the
 * layout viewport when the keyboard opens, so without this the bottom of the
 * panel (its confirm button, the end of a list) ends up hidden behind it.
 */
export function useVisibleViewport(
    active: boolean,
): VisibleViewport | undefined {
    const [viewport, setViewport] = useState<VisibleViewport>();

    useEffect(() => {
        if (!active) {
            return;
        }

        const visualViewport = window.visualViewport;

        const update = () => {
            setViewport({
                top: visualViewport?.offsetTop ?? 0,
                height: visualViewport?.height ?? window.innerHeight,
            });
        };

        update();
        visualViewport?.addEventListener('resize', update);
        visualViewport?.addEventListener('scroll', update);

        return () => {
            visualViewport?.removeEventListener('resize', update);
            visualViewport?.removeEventListener('scroll', update);
        };
    }, [active]);

    // A stale reading from the last time it was open is never handed out.
    return active ? viewport : undefined;
}
