import { Filter, SearchX, X } from 'lucide-react';
import type { CSSProperties, ReactNode, Ref } from 'react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

export type PickerFilter = {
    key: string;
    label: string;
    onRemove: () => void;
};

/**
 * Says why a list is shorter than the business's full catalogue — "only what
 * fits" the specialist or location already chosen — and lets the visitor drop
 * that choice right here to see everything again.
 */
export function FilterChips({ filters }: { filters: PickerFilter[] }) {
    const { t } = useTranslation('booking');

    if (filters.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
                <Filter className="size-3" />
                {t('v2.picker.filteredBy')}
            </span>

            {filters.map((filter) => (
                <button
                    key={filter.key}
                    type="button"
                    onClick={filter.onRemove}
                    aria-label={t('v2.picker.removeFilter', {
                        name: filter.label,
                    })}
                    data-test={`booking-picker-filter-${filter.key}`}
                    className="inline-flex max-w-full items-center gap-1 rounded-full bg-brand-accent py-1 pr-1.5 pl-2.5 font-medium text-foreground transition-colors hover:bg-primary/20"
                >
                    <span className="truncate">{filter.label}</span>
                    <X className="size-3 shrink-0" />
                </button>
            ))}
        </div>
    );
}

type EmptyProps = {
    query: string;
    onClear: () => void;
};

/** Nothing matched the search: say so, and offer the way back. */
export function PickerEmpty({ query, onClear }: EmptyProps) {
    const { t } = useTranslation('booking');

    return (
        <div
            className="flex flex-col items-center px-6 py-12 text-center motion-safe:animate-rise-in"
            data-test="booking-picker-empty"
        >
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <SearchX className="size-5" />
            </span>
            <p className="mt-4 font-medium">
                {t('v2.picker.noMatches', { query: query.trim() })}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
                {t('v2.picker.noMatchesHint')}
            </p>
            <Button
                type="button"
                variant="outline"
                className="mt-5"
                onClick={onClear}
            >
                {t('v2.picker.clearSearch')}
            </Button>
        </div>
    );
}

/** Only the first screenful staggers in; past that the delay is just lag. */
export function staggerStyle(index: number): CSSProperties | undefined {
    return index < 12 ? { animationDelay: `${index * 25}ms` } : undefined;
}

/** Brings the current choice into view when a picker reopens on it. */
export function scrollSelectedIntoView(list: HTMLElement | null): void {
    list?.querySelector('[data-selected="true"]')?.scrollIntoView({
        block: 'center',
    });
}

type LayoutProps = {
    /** Search box, category chips and filters: pinned above the list. */
    toolbar: ReactNode;
    children: ReactNode;
    listRef?: Ref<HTMLDivElement>;
};

/** A picker body: a pinned toolbar over a list that scrolls on its own. */
export function PickerLayout({ toolbar, children, listRef }: LayoutProps) {
    return (
        <>
            <div className="shrink-0 space-y-3 border-b px-4 pb-3 md:px-5">
                {toolbar}
            </div>
            <div
                ref={listRef}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-1 pb-6 md:px-5"
            >
                {children}
            </div>
        </>
    );
}
