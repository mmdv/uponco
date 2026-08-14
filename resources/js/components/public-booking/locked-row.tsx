import { Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

type Props = {
    icon: LucideIcon;
    /** What this row is, e.g. "Specialist". */
    title: string;
    /** The single possible answer, already applied. */
    value: string;
    /** Opens the detail dialog; omitted when there is nothing more to show. */
    onShowDetails?: () => void;
    detailsLabel?: string;
    /** Detail rendered under the row, e.g. a location's address. */
    children?: ReactNode;
    'data-test'?: string;
};

/**
 * A decision that was never the visitor's to make: the only specialist a solo
 * business has, or whatever a deep link pinned.
 *
 * Deliberately not an {@link ExpandableCard} with one row inside — a control
 * that can only ever produce the answer already on screen is noise, and asking
 * someone to open it reads as though there were an alternative.
 */
export default function LockedRow({
    icon: Icon,
    title,
    value,
    onShowDetails,
    detailsLabel,
    children,
    'data-test': dataTest,
}: Props) {
    return (
        <div
            className="rounded-2xl border border-border bg-card p-4"
            data-test={dataTest}
        >
            <div className="flex items-center gap-3">
                {/*
                 * Filled rather than badged with a tick: a check answers
                 * "you chose this", and nobody chose this.
                 */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{title}</p>
                    <p className="truncate font-medium">{value}</p>
                </div>

                {onShowDetails && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground"
                        onClick={onShowDetails}
                        aria-label={detailsLabel ?? `About ${value}`}
                        data-test={dataTest ? `${dataTest}-info` : undefined}
                    >
                        <Info className="size-4" />
                    </Button>
                )}
            </div>

            {children && <div className="mt-3 pl-13">{children}</div>}
        </div>
    );
}
