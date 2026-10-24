import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A small frosted card that overlaps a phone's edge and drifts gently, showing
 * one real detail from the product ("Next available", "New booking", …).
 * Position it with absolute offset classes in `className`; `delay` staggers
 * the float so neighbouring cards don't bob in step.
 */
export function FloatingCard({
    icon,
    title,
    meta,
    eyebrow,
    className,
    delay = 0,
}: {
    icon: ReactNode;
    title: string;
    meta?: string;
    /** Optional notification-style header line, e.g. "Uponco · now". */
    eyebrow?: string;
    className?: string;
    delay?: number;
}) {
    return (
        <div className={cn('absolute z-20', className)} aria-hidden>
            <div
                className="flex animate-float-y items-center gap-3 rounded-2xl glass p-3 pr-4 text-left"
                style={{ animationDelay: `${delay}s` } as CSSProperties}
            >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground [&_svg]:size-4.5">
                    {icon}
                </span>
                <span className="flex min-w-0 flex-col">
                    {eyebrow && (
                        <span className="text-[11px] font-medium text-muted-foreground">
                            {eyebrow}
                        </span>
                    )}
                    <span className="text-sm leading-tight font-semibold whitespace-nowrap text-foreground">
                        {title}
                    </span>
                    {meta && (
                        <span className="text-xs whitespace-nowrap text-muted-foreground">
                            {meta}
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
}
