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
    'data-test': dataTest,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    selected: boolean;
    onSelect: () => void;
    'data-test'?: string;
}) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={onSelect}
            data-test={dataTest}
            className={cn(
                'relative flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                selected
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'hover:bg-accent/50',
            )}
        >
            <span
                className={cn(
                    'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border',
                    selected
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'text-muted-foreground',
                )}
            >
                <Icon className="size-5" />
            </span>
            <span className="min-w-0 space-y-1 pr-6">
                <span
                    className={cn(
                        'block text-sm font-medium',
                        selected && 'text-primary',
                    )}
                >
                    {title}
                </span>
                <span className="block text-sm text-muted-foreground">
                    {description}
                </span>
            </span>
            {selected && (
                <CheckCircle2 className="absolute top-4 right-4 size-5 text-primary" />
            )}
        </button>
    );
}
