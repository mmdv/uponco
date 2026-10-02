import { Check, Info, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

type Props = {
    icon: LucideIcon;
    /** What this row decides, e.g. "Specialist". */
    title: string;
    /** Prompt shown while nothing is chosen. */
    hint: string;
    /** The current choice, or null while there is none. */
    value?: string | null;
    /** A second line under the choice: duration and price, a job title… */
    meta?: string | null;
    /** Replaces the icon once chosen, e.g. the specialist's photo. */
    media?: ReactNode;
    /** Never the visitor's choice: no picker, no clear button. */
    locked?: boolean;
    /** The server rejected this choice; outline it until it is made again. */
    invalid?: boolean;
    onOpen?: () => void;
    onClear?: () => void;
    onShowDetails?: () => void;
    detailsLabel?: string;
    'data-test'?: string;
};

/**
 * One decision on the booking hub. Empty, it is a prompt that opens its
 * picker; chosen, it reads back the choice (tap to change, × to clear);
 * locked, it is a plain statement of what was decided for the visitor.
 */
export default function ChoiceRow({
    icon: Icon,
    title,
    hint,
    value,
    meta,
    media,
    locked = false,
    invalid = false,
    onOpen,
    onClear,
    onShowDetails,
    detailsLabel,
    'data-test': dataTest,
}: Props) {
    const { t } = useTranslation('booking');
    const chosen = Boolean(value);
    const interactive = !locked && onOpen !== undefined;

    return (
        <div
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            onClick={interactive ? onOpen : undefined}
            onKeyDown={(event) => {
                if (
                    interactive &&
                    (event.key === 'Enter' || event.key === ' ')
                ) {
                    event.preventDefault();
                    onOpen?.();
                }
            }}
            aria-invalid={invalid || undefined}
            data-test={dataTest}
            data-chosen={chosen}
            className={cn(
                'group relative flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-soft transition-all duration-200 outline-none',
                interactive &&
                    'cursor-pointer hover:-translate-y-px hover:border-primary/40 hover:shadow-md focus-visible:ring-4 focus-visible:ring-primary/20 active:translate-y-0',
                !chosen && interactive && 'border-dashed border-foreground/15',
                chosen && !locked && 'border-primary/30',
                locked && 'border-border',
                invalid && 'border-destructive ring-4 ring-destructive/15',
            )}
        >
            <div className="relative shrink-0">
                {chosen && media ? (
                    media
                ) : (
                    <span
                        className={cn(
                            'flex size-11 items-center justify-center rounded-full transition-colors duration-300',
                            chosen || locked
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground group-hover:bg-brand-accent group-hover:text-primary',
                        )}
                    >
                        <Icon className="size-5" />
                    </span>
                )}

                {chosen && !locked && (
                    <span className="absolute -right-0.5 -bottom-0.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card motion-safe:animate-pop-in">
                        <Check className="size-3" strokeWidth={3} />
                    </span>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {title}
                    {locked && (
                        <span className="rounded-full bg-muted px-1.5 py-px text-[10px] font-medium">
                            {t('v2.hub.setForYou')}
                        </span>
                    )}
                </p>

                {chosen ? (
                    <div key={value} className="motion-safe:animate-rise-in">
                        <p className="truncate font-semibold">{value}</p>
                        {meta && (
                            <p className="truncate text-xs text-muted-foreground">
                                {meta}
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="truncate font-medium text-foreground/80">
                        {hint}
                    </p>
                )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
                {onShowDetails && (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onShowDetails();
                        }}
                        onKeyDown={(event) => event.stopPropagation()}
                        aria-label={detailsLabel}
                        data-test={dataTest ? `${dataTest}-info` : undefined}
                        className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <Info className="size-4" />
                    </button>
                )}

                {interactive && chosen && onClear && (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onClear();
                        }}
                        onKeyDown={(event) => event.stopPropagation()}
                        aria-label={t('v2.hub.clear', { name: title })}
                        data-test={dataTest ? `${dataTest}-clear` : undefined}
                        className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
