import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * The scrolling half of a screen. Short screens sit optically centred; long
 * ones — the service details, in practice — grow downwards, and the `-safe`
 * alignment is what stops their top being scrolled out of reach.
 */
export function ScreenBody({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex min-w-0 flex-1 flex-col justify-center-safe gap-6 py-6 md:py-10',
                className,
            )}
        >
            {children}
        </div>
    );
}

/**
 * The action bar. Sticky rather than fixed so it sits at the bottom of a short
 * screen and stays at the bottom of the viewport on a long one, and bleeds to
 * the edges of the phone screen or of the desktop card.
 */
export function ScreenFooterBar({ children }: { children: ReactNode }) {
    return (
        <div className="sticky bottom-0 z-10 -mx-4 border-t bg-background px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:-mx-8 md:px-8 md:pb-4">
            {children}
        </div>
    );
}

/**
 * The frame every screen sits in. Screens built around a `<Form>` compose
 * {@link ScreenBody} and {@link ScreenFooterBar} themselves, so that their
 * submit button stays inside the form element.
 */
export default function OnboardingScreen({
    children,
    footer,
}: {
    children: ReactNode;
    footer: ReactNode;
}) {
    return (
        <div className="flex min-h-full flex-1 flex-col">
            <ScreenBody>{children}</ScreenBody>
            <ScreenFooterBar>{footer}</ScreenFooterBar>
        </div>
    );
}
