import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ArrowLeft, X } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/use-translation';
import { useVisibleViewport } from '@/hooks/use-visible-viewport';
import { cn } from '@/lib/utils';

export type SheetStep = {
    key: string;
    label: string;
    /** Something is already chosen for this step. */
    done: boolean;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    /**
     * Changes whenever the sheet moves on to another choice, replaying the
     * crossfade (and the list's stagger) so the swap reads as progress.
     */
    contentKey: string;
    /** The choices this sheet walks through, shown as a small progress rail. */
    steps: SheetStep[];
    /** Brand colours; the sheet is portalled outside the page's brand scope. */
    style?: CSSProperties;
    /** Pinned under the list: the button that moves on once a choice is made. */
    footer?: ReactNode;
    children: ReactNode;
};

/**
 * The booking pickers' shell, after the onboarding `SelectDialog`: a full-screen
 * panel that slides up on a phone (sized to the area above the keyboard) and a
 * centred dialog on larger screens. The body is a picker's `PickerLayout`.
 *
 * Picking only selects; the footer button moves on, and because the sheet
 * stays mounted the next choice crossfades in rather than reopening.
 *
 * Motion runs one way only — the panel rises, the rows stagger up — so
 * nothing on screen travels sideways against anything else.
 */
export default function SelectionSheet({
    open,
    onOpenChange,
    title,
    contentKey,
    steps,
    style,
    footer,
    children,
}: Props) {
    const { t } = useTranslation('booking');
    const isMobile = useIsMobile();
    const viewport = useVisibleViewport(open && isMobile);
    const currentIndex = steps.findIndex((step) => step.key === contentKey);

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay
                    className={cn(
                        'fixed inset-0 z-50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
                        isMobile
                            ? 'bg-background'
                            : 'bg-black/50 backdrop-blur-[2px]',
                    )}
                />

                <DialogPrimitive.Content
                    aria-describedby={undefined}
                    data-test="booking-picker"
                    style={{
                        ...style,
                        ...(isMobile
                            ? {
                                  top: viewport?.top ?? 0,
                                  height: viewport?.height ?? '100dvh',
                              }
                            : {}),
                    }}
                    // A phone's keyboard would cover half the list on open.
                    onOpenAutoFocus={(event) => {
                        if (isMobile) {
                            event.preventDefault();
                        }
                    }}
                    className={cn(
                        'fixed z-50 flex flex-col overflow-hidden bg-background text-foreground outline-none',
                        isMobile
                            ? 'inset-x-0 w-full duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom'
                            : 'top-1/2 left-1/2 h-[min(720px,88vh)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border shadow-2xl ease-[cubic-bezier(0.2,0.8,0.2,1)] data-[state=closed]:animate-out data-[state=closed]:duration-150 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:animate-in data-[state=open]:duration-300 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-3',
                    )}
                >
                    <header
                        className={cn(
                            'flex shrink-0 items-center gap-2',
                            isMobile ? 'h-14 px-2' : 'px-5 pt-5 pb-2',
                        )}
                    >
                        {isMobile && (
                            <DialogPrimitive.Close
                                aria-label={t('v2.picker.back')}
                                className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <ArrowLeft className="size-5" />
                            </DialogPrimitive.Close>
                        )}

                        <div
                            key={contentKey}
                            className="min-w-0 flex-1 motion-safe:animate-in motion-safe:duration-300 motion-safe:fade-in-0"
                        >
                            {steps.length > 1 && currentIndex !== -1 && (
                                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                    {t('v2.progress.label', {
                                        current: currentIndex + 1,
                                        total: steps.length,
                                        name: steps[currentIndex].label,
                                    })}
                                </p>
                            )}
                            <DialogPrimitive.Title className="truncate text-lg font-semibold">
                                {title}
                            </DialogPrimitive.Title>
                        </div>

                        {!isMobile && (
                            <DialogPrimitive.Close
                                aria-label={t('v2.picker.close')}
                                className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <X className="size-4" />
                            </DialogPrimitive.Close>
                        )}
                    </header>

                    {steps.length > 1 && (
                        <div
                            className={cn(
                                'flex shrink-0 gap-1.5 pb-3',
                                isMobile ? 'px-4' : 'px-5',
                            )}
                            aria-hidden
                        >
                            {steps.map((step) => (
                                <span
                                    key={step.key}
                                    className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
                                >
                                    <span
                                        className={cn(
                                            'block h-full origin-left rounded-full bg-primary transition-transform duration-500 ease-out',
                                            step.done || step.key === contentKey
                                                ? 'scale-x-100'
                                                : 'scale-x-0',
                                            !step.done &&
                                                step.key === contentKey &&
                                                'opacity-40',
                                        )}
                                    />
                                </span>
                            ))}
                        </div>
                    )}

                    <div
                        key={contentKey}
                        className="flex min-h-0 flex-1 flex-col motion-safe:animate-in motion-safe:duration-300 motion-safe:fade-in-0"
                    >
                        {children}
                    </div>

                    {footer && (
                        <div className="shrink-0 border-t bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-5">
                            {footer}
                        </div>
                    )}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
