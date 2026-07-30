import { useEffect } from 'react';

/** Ignore small gaps — those come from the mobile URL bar, not the keyboard. */
const KEYBOARD_THRESHOLD = 120;

/**
 * Exposes the on-screen keyboard height as the `--keyboard-inset` CSS variable
 * on the document root.
 *
 * Mobile browsers don't shrink the layout viewport when the keyboard opens, so
 * a `100dvh` scroll container keeps its full height and the bottom of a form
 * ends up underneath the keyboard with nowhere left to scroll. Padding a form
 * by this value gives the scroll container the extra room it needs.
 */
export function useKeyboardInset(): void {
    useEffect(() => {
        const viewport = window.visualViewport;

        if (!viewport) {
            return;
        }

        const root = document.documentElement;

        const update = () => {
            const gap =
                window.innerHeight - viewport.height - viewport.offsetTop;
            const inset = gap > KEYBOARD_THRESHOLD ? Math.round(gap) : 0;

            root.style.setProperty('--keyboard-inset', `${inset}px`);
        };

        update();
        viewport.addEventListener('resize', update);
        viewport.addEventListener('scroll', update);

        return () => {
            viewport.removeEventListener('resize', update);
            viewport.removeEventListener('scroll', update);
            root.style.removeProperty('--keyboard-inset');
        };
    }, []);
}
