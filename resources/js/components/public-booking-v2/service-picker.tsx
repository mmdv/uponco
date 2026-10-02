import { Check, Clock } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import Highlight from '@/components/public-booking-v2/highlight';
import {
    FilterChips,
    PickerEmpty,
    PickerLayout,
    scrollSelectedIntoView,
    staggerStyle,
} from '@/components/public-booking-v2/picker-parts';
import type { PickerFilter } from '@/components/public-booking-v2/picker-parts';
import SearchField from '@/components/public-booking-v2/search-field';
import { useTranslation } from '@/hooks/use-translation';
import { formatDuration, formatServicePrice } from '@/lib/appointments';
import type { ServiceCategoryGroup } from '@/lib/appointments';
import { filterServiceGroups } from '@/lib/booking-search';
import { cn } from '@/lib/utils';

type Props = {
    groups: ServiceCategoryGroup[];
    selectedId: number | null;
    onSelect: (serviceId: number) => void;
    /** Other choices currently narrowing this list. */
    filters?: PickerFilter[];
    autoFocus?: boolean;
};

/**
 * Searchable, category-aware service list for catalogues of any size.
 *
 * A rail of category chips narrows to one category; the search box matches
 * titles, descriptions and category names, ignoring accents. Results stay
 * grouped under sticky category headings, with the matched words picked out.
 */
export default function ServicePicker({
    groups,
    selectedId,
    onSelect,
    filters = [],
    autoFocus = false,
}: Props) {
    const { t } = useTranslation('booking');
    const [query, setQuery] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const total = groups.reduce((sum, group) => sum + group.services.length, 0);
    const categories = groups.filter((group) => group.id !== null);
    const showCategories = categories.length > 1;

    // Per-category counts follow the search, so the chips say where the
    // matches are before the visitor taps one.
    const matchedByCategory = useMemo(
        () => filterServiceGroups(groups, query, null),
        [groups, query],
    );
    const countFor = (id: number | null) =>
        (id === null
            ? matchedByCategory
            : matchedByCategory.filter((group) => group.id === id)
        ).reduce((sum, group) => sum + group.services.length, 0);

    const visible = useMemo(
        () => filterServiceGroups(groups, query, categoryId),
        [groups, query, categoryId],
    );
    const visibleCount = visible.reduce(
        (sum, group) => sum + group.services.length,
        0,
    );

    useEffect(() => scrollSelectedIntoView(listRef.current), []);

    const chooseCategory = (id: number | null) => {
        setCategoryId(id);

        if (listRef.current) {
            listRef.current.scrollTop = 0;
        }
    };

    const clearSearch = () => {
        setQuery('');
        setCategoryId(null);
    };

    const toolbar = (
        <>
            <SearchField
                value={query}
                onChange={setQuery}
                placeholder={t('v2.picker.searchServices', { count: total })}
                autoFocus={autoFocus}
                data-test="booking-service-search"
            />

            {showCategories && (
                <div
                    className="-mx-4 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-4 md:-mx-5 md:px-5 [&::-webkit-scrollbar]:hidden"
                    role="tablist"
                >
                    {[
                        { id: null, name: t('v2.picker.allCategories') },
                        ...categories,
                    ].map((category) => {
                        const active = category.id === categoryId;
                        const count = countFor(category.id);

                        return (
                            <button
                                key={category.id ?? 'all'}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => chooseCategory(category.id)}
                                data-test={`booking-category-${category.id ?? 'all'}`}
                                className={cn(
                                    'flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium whitespace-nowrap transition-all duration-200',
                                    active
                                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                        : 'border-border bg-background hover:border-primary/40',
                                    count === 0 && !active && 'opacity-45',
                                )}
                            >
                                {category.name}
                                <span
                                    className={cn(
                                        'rounded-full px-1.5 text-[10px] tabular-nums',
                                        active
                                            ? 'bg-primary-foreground/20'
                                            : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            <FilterChips filters={filters} />
        </>
    );

    return (
        <PickerLayout toolbar={toolbar} listRef={listRef}>
            {groups.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                    {t('selection.noServices')}
                </p>
            ) : visibleCount === 0 ? (
                <PickerEmpty query={query} onClear={clearSearch} />
            ) : (
                <>
                    {query.trim() !== '' && (
                        <p
                            className="pt-2 text-xs text-muted-foreground"
                            aria-live="polite"
                        >
                            {t('v2.picker.found', { count: visibleCount })}
                        </p>
                    )}

                    {visible.map((group) => (
                        <section key={group.id ?? 'uncategorized'}>
                            {group.name !== null && (
                                <h3 className="sticky top-0 z-10 -mx-1 flex items-center justify-between bg-background/95 px-1 pt-3 pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase backdrop-blur">
                                    <Highlight
                                        text={group.name}
                                        query={query}
                                    />
                                    <span className="tabular-nums">
                                        {group.services.length}
                                    </span>
                                </h3>
                            )}

                            <div className="space-y-2 pb-2">
                                {group.services.map((service, index) => {
                                    const isSelected =
                                        service.id === selectedId;
                                    const price = formatServicePrice(service);

                                    return (
                                        <button
                                            key={service.id}
                                            type="button"
                                            onClick={() => onSelect(service.id)}
                                            data-selected={isSelected}
                                            data-test={`booking-service-${service.id}`}
                                            style={staggerStyle(index)}
                                            className={cn(
                                                'group flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 active:scale-[0.99] motion-safe:animate-rise-in',
                                                isSelected
                                                    ? 'border-primary bg-brand-accent ring-1 ring-primary'
                                                    : 'border-border bg-card hover:border-primary/40 hover:shadow-sm',
                                            )}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm leading-snug font-medium">
                                                    <Highlight
                                                        text={service.title}
                                                        query={query}
                                                    />
                                                </p>
                                                {service.description && (
                                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                        {service.description}
                                                    </p>
                                                )}
                                                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="size-3" />
                                                    {formatDuration(
                                                        service.duration,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="flex shrink-0 flex-col items-end gap-2">
                                                <span
                                                    className={cn(
                                                        'flex size-6 items-center justify-center rounded-full border transition-all duration-200',
                                                        isSelected
                                                            ? 'scale-100 border-primary bg-primary text-primary-foreground'
                                                            : 'border-muted-foreground/30 group-hover:border-primary/60',
                                                    )}
                                                >
                                                    {isSelected && (
                                                        <Check className="size-3.5 motion-safe:animate-pop-in" />
                                                    )}
                                                </span>
                                                {price && (
                                                    <span className="text-sm font-semibold whitespace-nowrap">
                                                        {price}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </>
            )}
        </PickerLayout>
    );
}
