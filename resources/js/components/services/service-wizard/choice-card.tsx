import type { LucideIcon } from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * A large selectable card used for the wizard's either/or decisions. Rendered
 * as a button so the whole surface is clickable; the selected card is tinted
 * with the primary colour, mirroring `selectedOptionStyles`.
 */
export default function ChoiceCard({
    icon: Icon,
    title,
    description,
    selected,
    onSelect,
    disabled = false,
    badge,
    'data-test': dataTest,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    selected: boolean;
    onSelect: () => void;
    /** Dims the card and blocks selection, for options that are not live yet. */
    disabled?: boolean;
    /** Small note beside the title, such as "Coming soon". */
    badge?: React.ReactNode;
    'data-test'?: string;
}) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={selected}
            aria-disabled={disabled || undefined}
            disabled={disabled}
            onClick={onSelect}
            data-test={dataTest}
            className={cn(
                'relative flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                disabled
                    ? 'cursor-not-allowed opacity-60'
                    : selected
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'hover:bg-accent/50',
            )}
        >
            <span
                className={cn(
                    'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border',
                    selected && !disabled
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'text-muted-foreground',
                )}
            >
                <Icon className="size-5" />
            </span>
            <span className="min-w-0 space-y-1 pr-6">
                <span className="flex flex-wrap items-center gap-2">
                    <span
                        className={cn(
                            'text-sm font-medium',
                            selected && !disabled && 'text-primary',
                        )}
                    >
                        {title}
                    </span>
                    {badge ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {badge}
                        </span>
                    ) : null}
                </span>
                <span className="block text-sm text-muted-foreground">
                    {description}
                </span>
            </span>
            {selected && !disabled && (
                <CheckCircle2 className="absolute top-4 right-4 size-5 text-primary" />
            )}
        </button>
    );
}
