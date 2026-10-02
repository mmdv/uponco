import { Check, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import Highlight from '@/components/public-booking-v2/highlight';
import LocationDetails from '@/components/public-booking-v2/location-details';
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
import { matchesSearch } from '@/lib/booking-search';
import { cn } from '@/lib/utils';
import type { AppointmentLocationDetail } from '@/types';

type Props = {
    locations: AppointmentLocationDetail[];
    selectedId: number | null;
    onSelect: (locationId: number) => void;
    filters?: PickerFilter[];
    autoFocus?: boolean;
};

/**
 * Searchable list of the company's locations. Branches are usually told apart
 * by where they are, so the search covers the address and city as well as the
 * name, and each row shows its address, phone and directions link inline.
 */
export default function LocationPicker({
    locations,
    selectedId,
    onSelect,
    filters = [],
    autoFocus = false,
}: Props) {
    const { t } = useTranslation('booking');
    const [query, setQuery] = useState('');
    const listRef = useRef<HTMLDivElement>(null);

    const visible = locations.filter((location) =>
        matchesSearch([location.name, location.address, location.city], query),
    );

    useEffect(() => scrollSelectedIntoView(listRef.current), []);

    const toolbar = (
        <>
            <SearchField
                value={query}
                onChange={setQuery}
                placeholder={t('v2.picker.searchLocations')}
                autoFocus={autoFocus}
                data-test="booking-location-search"
            />
            <FilterChips filters={filters} />
        </>
    );

    return (
        <PickerLayout toolbar={toolbar} listRef={listRef}>
            {locations.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                    {t('selection.noLocations')}
                </p>
            ) : visible.length === 0 ? (
                <PickerEmpty query={query} onClear={() => setQuery('')} />
            ) : (
                <div className="space-y-2 pt-3">
                    {visible.map((location, index) => {
                        const isSelected = location.id === selectedId;

                        return (
                            // A button can't contain the phone and directions
                            // links, so the row is a div with a button role.
                            <div
                                key={location.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => onSelect(location.id)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === 'Enter' ||
                                        event.key === ' '
                                    ) {
                                        event.preventDefault();
                                        onSelect(location.id);
                                    }
                                }}
                                data-selected={isSelected}
                                data-test={`booking-location-${location.id}`}
                                style={staggerStyle(index)}
                                className={cn(
                                    'group w-full cursor-pointer rounded-2xl border p-3.5 text-left transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-primary/20 active:scale-[0.99] motion-safe:animate-rise-in',
                                    isSelected
                                        ? 'border-primary bg-brand-accent ring-1 ring-primary'
                                        : 'border-border bg-card hover:border-primary/40 hover:shadow-sm',
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={cn(
                                            'flex size-10 shrink-0 items-center justify-center rounded-full transition-colors',
                                            isSelected
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground',
                                        )}
                                    >
                                        <MapPin className="size-4" />
                                    </span>

                                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                        <Highlight
                                            text={location.name}
                                            query={query}
                                        />
                                    </span>

                                    <span
                                        className={cn(
                                            'flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200',
                                            isSelected
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-muted-foreground/30 group-hover:border-primary/60',
                                        )}
                                    >
                                        {isSelected && (
                                            <Check className="size-3.5 motion-safe:animate-pop-in" />
                                        )}
                                    </span>
                                </div>

                                <LocationDetails
                                    location={location}
                                    compact
                                    className="mt-2 pl-13 text-xs"
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </PickerLayout>
    );
}
