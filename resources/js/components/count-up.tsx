import { useEffect, useRef, useState } from 'react';

type Props = {
    /** The final value to count up to. */
    to: number;
    /** How long the count takes, in milliseconds. */
    durationMs?: number;
    className?: string;
};

/**
 * Counts from zero up to `to` once it scrolls into view, easing out so the
 * number settles rather than stopping dead. Respects reduced-motion by jumping
 * straight to the final value. The animation runs a single time per mount.
 */
export default function CountUp({ to, durationMs = 1400, className }: Props) {
    const [value, setValue] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const node = ref.current;

        if (!node) {
            return;
        }

        let frame = 0;
        const prefersReduced = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (prefersReduced) {
            frame = requestAnimationFrame(() => setValue(to));

            return () => cancelAnimationFrame(frame);
        }

        let startedAt = 0;

        const tick = (now: number) => {
            if (startedAt === 0) {
                startedAt = now;
            }

            const progress = Math.min((now - startedAt) / durationMs, 1);
            // easeOutCubic — quick to start, gentle to land.
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * to));

            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    frame = requestAnimationFrame(tick);
                    observer.disconnect();
                }
            },
            { threshold: 0.4 },
        );

        observer.observe(node);

        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, [to, durationMs]);

    return (
        <span ref={ref} className={className}>
            {value}
        </span>
    );
}
