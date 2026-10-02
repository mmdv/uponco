import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Props = {
    title: string;
    children?: ReactNode;
    className?: string;
    'data-test'?: string;
};

/**
 * A step-level error the visitor cannot miss: tinted, iconed, announced to
 * screen readers, and given a short shake as it appears so a bounce back to an
 * earlier step reads as "this needs you" rather than a silent jump.
 */
export default function ErrorAlert({
    title,
    children,
    className,
    'data-test': dataTest,
}: Props) {
    return (
        <div
            role="alert"
            data-test={dataTest}
            className={cn(
                'flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm motion-safe:animate-shake',
                className,
            )}
        >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive text-white">
                <AlertCircle className="size-4" />
            </span>

            <div className="min-w-0 space-y-0.5 pt-1">
                <p className="font-semibold text-destructive">{title}</p>
                {children && <div className="text-foreground">{children}</div>}
            </div>
        </div>
    );
}
