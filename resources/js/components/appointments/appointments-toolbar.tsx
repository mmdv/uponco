import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import type { MultiSelectOption } from '@/components/ui/multi-select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type {
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSpecialistOption,
} from '@/types';

export type AppointmentFilters = {
    locationIds: string[];
    serviceIds: string[];
    specialistIds: string[];
};

export const EMPTY_FILTERS: AppointmentFilters = {
    locationIds: [],
    serviceIds: [],
    specialistIds: [],
};

export type AppointmentTab = 'upcoming' | 'past';
export type AppointmentView = 'minimal' | 'day' | 'week' | 'month';

const VIEW_OPTIONS: AppointmentView[] = ['minimal', 'day', 'week', 'month'];

type Props = {
    filters: AppointmentFilters;
    onFiltersChange: (filters: AppointmentFilters) => void;
    services: AppointmentServiceOption[];
    locations: AppointmentLocationOption[];
    specialists: AppointmentSpecialistOption[];
    tab: AppointmentTab;
    onTabChange: (tab: AppointmentTab) => void;
    upcomingCount: number;
    pastCount: number;
    view: AppointmentView;
    onViewChange: (view: AppointmentView) => void;
};

export default function AppointmentsToolbar({
    filters,
    onFiltersChange,
    services,
    locations,
    specialists,
    tab,
    onTabChange,
    upcomingCount,
    pastCount,
    view,
    onViewChange,
}: Props) {
    const { t } = useTranslation('appointments');
    // Collapsed by default; the trigger only shows on mobile, and on desktop the
    // filters stay expanded regardless of this state (see `sm:block` below).
    const [expanded, setExpanded] = useState(false);

    const activeFilterCount =
        filters.locationIds.length +
        filters.serviceIds.length +
        filters.specialistIds.length;

    const locationOptions: MultiSelectOption[] = locations.map((location) => ({
        value: String(location.id),
        label: location.name,
    }));

    const serviceOptions: MultiSelectOption[] = services.map((service) => ({
        value: String(service.id),
        label: service.title,
    }));

    const specialistOptions: MultiSelectOption[] = specialists.map(
        (specialist) => ({
            value: String(specialist.id),
            label: specialist.name,
        }),
    );

    const updateFilter = (key: keyof AppointmentFilters, value: string[]) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const clearFilter = (key: keyof AppointmentFilters) => {
        onFiltersChange({ ...filters, [key]: [] });
    };

    const clearFilters = () => onFiltersChange(EMPTY_FILTERS);

    return (
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
            {/* Filters */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    {/* Mobile: tapping the label toggles the filters. */}
                    <button
                        type="button"
                        onClick={() => setExpanded((open) => !open)}
                        className="flex items-center gap-2 sm:cursor-default"
                        data-test="appointments-filters-toggle"
                        aria-expanded={expanded}
                    >
                        <SlidersHorizontal className="size-4 text-muted-foreground sm:hidden" />
                        <span className="text-sm font-medium text-foreground">
                            {t('toolbar.filters')}
                        </span>
                        {activeFilterCount > 0 ? (
                            <Badge
                                variant="secondary"
                                data-test="appointments-active-filter-count"
                            >
                                {activeFilterCount}
                            </Badge>
                        ) : null}
                        <ChevronDown
                            className={cn(
                                'size-4 text-muted-foreground transition-transform sm:hidden',
                                expanded && 'rotate-180',
                            )}
                        />
                    </button>

                    {activeFilterCount > 0 ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            data-test="appointments-clear-filters"
                            className="h-8 px-2 text-muted-foreground"
                        >
                            <X className="size-4" /> {t('toolbar.clearAll')}
                        </Button>
                    ) : null}
                </div>

                <div
                    className={cn(
                        'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3',
                        expanded ? 'grid' : 'hidden sm:grid',
                    )}
                >
                    <FilterField
                        name="location"
                        label={t('toolbar.location')}
                        clearLabel={t('toolbar.clear')}
                        count={filters.locationIds.length}
                        onClear={() => clearFilter('locationIds')}
                    >
                        <MultiSelect
                            options={locationOptions}
                            value={filters.locationIds}
                            onChange={(value) =>
                                updateFilter('locationIds', value)
                            }
                            placeholder={t('toolbar.allLocations')}
                            className={cn(
                                filters.locationIds.length > 0 &&
                                    'border-primary ring-1 ring-primary/30',
                            )}
                            data-test="appointments-filter-location"
                        />
                    </FilterField>

                    <FilterField
                        name="service"
                        label={t('toolbar.service')}
                        clearLabel={t('toolbar.clear')}
                        count={filters.serviceIds.length}
                        onClear={() => clearFilter('serviceIds')}
                    >
                        <MultiSelect
                            options={serviceOptions}
                            value={filters.serviceIds}
                            onChange={(value) =>
                                updateFilter('serviceIds', value)
                            }
                            placeholder={t('toolbar.allServices')}
                            className={cn(
                                filters.serviceIds.length > 0 &&
                                    'border-primary ring-1 ring-primary/30',
                            )}
                            data-test="appointments-filter-service"
                        />
                    </FilterField>

                    <FilterField
                        name="specialist"
                        label={t('toolbar.specialist')}
                        clearLabel={t('toolbar.clear')}
                        count={filters.specialistIds.length}
                        onClear={() => clearFilter('specialistIds')}
                    >
                        <MultiSelect
                            options={specialistOptions}
                            value={filters.specialistIds}
                            onChange={(value) =>
                                updateFilter('specialistIds', value)
                            }
                            placeholder={t('toolbar.allSpecialists')}
                            className={cn(
                                filters.specialistIds.length > 0 &&
                                    'border-primary ring-1 ring-primary/30',
                            )}
                            data-test="appointments-filter-specialist"
                        />
                    </FilterField>
                </div>
            </div>

            <div className="h-px bg-border" />

            {/* Timeframe + view */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <ToggleGroup
                    type="single"
                    variant="outline"
                    value={tab}
                    onValueChange={(value) => {
                        if (value) {
                            onTabChange(value as AppointmentTab);
                        }
                    }}
                    className="w-full sm:w-auto"
                >
                    <ToggleGroupItem
                        value="upcoming"
                        className="flex-1 gap-2 sm:flex-none"
                        data-test="appointments-tab-upcoming"
                    >
                        {t('toolbar.upcoming')}
                        <CountBadge active={tab === 'upcoming'}>
                            {upcomingCount}
                        </CountBadge>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="past"
                        className="flex-1 gap-2 sm:flex-none"
                        data-test="appointments-tab-past"
                    >
                        {t('toolbar.past')}
                        <CountBadge active={tab === 'past'}>
                            {pastCount}
                        </CountBadge>
                    </ToggleGroupItem>
                </ToggleGroup>

                <ToggleGroup
                    type="single"
                    variant="outline"
                    value={view}
                    onValueChange={(value) => {
                        if (value) {
                            onViewChange(value as AppointmentView);
                        }
                    }}
                    className="w-full sm:w-auto"
                    data-test="appointment-view-select"
                >
                    {VIEW_OPTIONS.map((option) => (
                        <ToggleGroupItem
                            key={option}
                            value={option}
                            className="flex-1 sm:flex-none"
                            data-test={`appointment-view-${option}`}
                        >
                            {t(`toolbar.views.${option}`)}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>
        </div>
    );
}

type FilterFieldProps = {
    /** Stable identifier used for test hooks (not translated). */
    name: string;
    label: string;
    clearLabel: string;
    count: number;
    onClear: () => void;
    children: React.ReactNode;
};

function FilterField({
    name,
    label,
    clearLabel,
    count,
    onClear,
    children,
}: FilterFieldProps) {
    const active = count > 0;

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
                <span
                    className={cn(
                        'flex items-center gap-1.5 text-xs font-medium text-muted-foreground',
                        active && 'text-primary',
                    )}
                >
                    {label}
                    {active ? (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] leading-none text-primary">
                            {count}
                        </span>
                    ) : null}
                </span>
                {active ? (
                    <button
                        type="button"
                        onClick={onClear}
                        className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                        data-test={`appointments-clear-${name}`}
                    >
                        <X className="size-3" /> {clearLabel}
                    </button>
                ) : null}
            </div>
            {children}
        </div>
    );
}

function CountBadge({
    active,
    children,
}: {
    active: boolean;
    children: React.ReactNode;
}) {
    return (
        <span
            className={cn(
                'rounded-full px-1.5 py-0.5 text-xs',
                active
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground',
            )}
        >
            {children}
        </span>
    );
}
