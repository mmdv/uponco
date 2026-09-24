import { Check, ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Props = {
    icon: LucideIcon;
    title: string;
    /** Hint shown under the title when nothing has been chosen yet. */
    hint: string;
    /** Label of the current choice, shown once the user has picked something. */
    selectedLabel?: string | null;
    open: boolean;
    onToggle: () => void;
    children: ReactNode;
};

/**
 * A tap-to-expand entry card used on the first booking step. The body animates
 * open/closed with a CSS grid-rows transition so it works without a motion lib.
 */
export default function ExpandableCard({
    icon: Icon,
    title,
    hint,
    selectedLabel,
    open,
    onToggle,
    children,
}: Props) {
    const hasSelection = Boolean(selectedLabel);

    return (
        <div
            className={cn(
                'overflow-hidden rounded-2xl border bg-card shadow-soft transition-all duration-300',
                open
                    ? 'border-primary/40 shadow-lg'
                    : 'border-black/[0.08] dark:border-border',
            )}
        >
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                className="flex w-full items-center gap-3 p-4 text-left"
            >
                <div
                    className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300',
                        hasSelection
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground',
                    )}
                >
                    {hasSelection ? (
                        <Check className="size-5" />
                    ) : (
                        <Icon className="size-5" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="font-medium">{title}</p>
                    <p className="truncate text-sm text-foreground">
                        {selectedLabel ?? hint}
                    </p>
                </div>

                <ChevronDown
                    className={cn(
                        'size-5 shrink-0 text-muted-foreground transition-transform duration-300',
                        open && 'rotate-180',
                    )}
                />
            </button>

            <div
                className={cn(
                    'grid transition-[grid-template-rows] duration-300 ease-out',
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
            >
                <div className="overflow-hidden">
                    <div className="border-t p-3">{children}</div>
                </div>
            </div>
        </div>
    );
}
