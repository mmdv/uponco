import { useCallback, useState } from 'react';
import type { RefCallback } from 'react';

type Options = {
    /** Stop observing after the first time the element comes into view. */
    once?: boolean;
    /** Grow or shrink the viewport box, e.g. `'0px 0px -10% 0px'`. */
    rootMargin?: string;
    threshold?: number;
};

/**
 * Whether an element is in the viewport, via an IntersectionObserver attached
 * through a callback ref (React 19 runs the returned cleanup on detach, so no
 * effect is needed). Where IntersectionObserver is missing — jsdom, very old
 * browsers — the element simply counts as visible.
 */
export function useInView<T extends Element>({
    once = false,
    rootMargin = '0px',
    threshold = 0,
}: Options = {}): [RefCallback<T>, boolean] {
    const [inView, setInView] = useState(false);

    const ref = useCallback<RefCallback<T>>(
        (node) => {
            if (node === null) {
                return;
            }

            if (typeof IntersectionObserver === 'undefined') {
                setInView(true);

                return;
            }

            const observer = new IntersectionObserver(
                ([entry]) => {
                    setInView(entry.isIntersecting);

                    if (once && entry.isIntersecting) {
                        observer.disconnect();
                    }
                },
                { rootMargin, threshold },
            );
            observer.observe(node);

            return () => observer.disconnect();
        },
        [once, rootMargin, threshold],
    );

    return [ref, inView];
}
