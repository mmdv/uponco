import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';

/**
 * Fades and lifts its children in the first time they scroll into view. The
 * motion itself is the `[data-reveal]` transition in app.css (off under
 * reduced motion); this only flips `data-revealed`.
 */
export function Reveal({
    children,
    delay = 0,
    className,
}: {
    children: ReactNode;
    /** Seconds to wait before revealing, for staggering siblings. */
    delay?: number;
    className?: string;
}) {
    const [ref, inView] = useInView<HTMLDivElement>({
        once: true,
        rootMargin: '0px 0px -10% 0px',
    });

    return (
        <div
            ref={ref}
            data-reveal=""
            data-revealed={inView ? '' : undefined}
            className={cn(className)}
            style={{ '--reveal-delay': `${delay}s` } as CSSProperties}
        >
            {children}
        </div>
    );
}
