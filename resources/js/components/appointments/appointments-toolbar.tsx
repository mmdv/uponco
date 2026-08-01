import {
    CalendarDays,
    CalendarPlus,
    CalendarRange,
    ChevronDown,
    LayoutGrid,
    List,
    SlidersHorizontal,
    X,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MultiSelect } from '@/components/ui/multi-select';
import type { MultiSelectOption } from '@/components/ui/multi-select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
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

const VIEW_ICONS: Record<AppointmentView, typeof List> = {
    minimal: List,
    day: CalendarDays,
    week: CalendarRange,
    month: LayoutGrid,
};

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
    onCreate: () => void;
    canCreate: boolean;
    /** Whether more than one location exists — hides a redundant location filter. */
    showLocation: boolean;
    /** Whether more than one specialist exists — hides a redundant specialist filter. */
    showSpecialist: boolean;
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
    onCreate,
    canCreate,
    showLocation,
    showSpecialist,
}: Props) {
    const { t } = useTranslation('appointments');
    const [filtersOpen, setFiltersOpen] = useState(false);

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

    const ViewIcon = VIEW_ICONS[view];

    return (
        <div className="flex items-center justify-between gap-2">
            {/* Filters — timeframe + facets live inside a single popover. */}
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        data-test="appointments-filters-toggle"
                    >
                        <SlidersHorizontal className="size-4" />
                        {t('toolbar.filters')}
                        {activeFilterCount > 0 ? (
                            <Badge
                                variant="secondary"
                                data-test="appointments-active-filter-count"
                            >
                                {activeFilterCount}
                            </Badge>
                        ) : null}
                        <ChevronDown className="size-4 opacity-60" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className="w-80 max-w-[calc(100vw-2rem)] space-y-4"
                >
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">
                            {t('toolbar.filters')}
                        </span>
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

                    {/* Timeframe comes first inside the filters. */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                            {t('toolbar.timeframe')}
                        </span>
                        <ToggleGroup
                            type="single"
                            variant="outline"
                            value={tab}
                            onValueChange={(value) => {
                                if (value) {
                                    onTabChange(value as AppointmentTab);
                                }
                            }}
                            className="w-full"
                        >
                            <ToggleGroupItem
                                value="upcoming"
                                className="flex-1 gap-2"
                                data-test="appointments-tab-upcoming"
                            >
                                {t('toolbar.upcoming')}
                                <CountBadge active={tab === 'upcoming'}>
                                    {upcomingCount}
                                </CountBadge>
                            </ToggleGroupItem>
                            <ToggleGroupItem
                                value="past"
                                className="flex-1 gap-2"
                                data-test="appointments-tab-past"
                            >
                                {t('toolbar.past')}
                                <CountBadge active={tab === 'past'}>
                                    {pastCount}
                                </CountBadge>
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    {showLocation ? (
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
                    ) : null}

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

                    {showSpecialist ? (
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
                    ) : null}
                </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2">
                {/* New appointment — desktop only; mobile uses a floating action button. */}
                <Button
                    className="hidden sm:inline-flex"
                    data-test="add-appointment-button"
                    disabled={!canCreate}
                    onClick={onCreate}
                >
                    <CalendarPlus /> {t('newAppointment')}
                </Button>

                {/* View picker — selected view is the button label. */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            data-test="appointment-view-select"
                        >
                            <ViewIcon className="size-4" />
                            <span className="hidden sm:inline">
                                {t(`toolbar.views.${view}`)}
                            </span>
                            <ChevronDown className="size-4 opacity-60" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuRadioGroup
                            value={view}
                            onValueChange={(value) =>
                                onViewChange(value as AppointmentView)
                            }
                        >
                            {VIEW_OPTIONS.map((option) => {
                                const OptionIcon = VIEW_ICONS[option];

                                return (
                                    <DropdownMenuRadioItem
                                        key={option}
                                        value={option}
                                        data-test={`appointment-view-${option}`}
                                    >
                                        <OptionIcon className="size-4" />
                                        {t(`toolbar.views.${option}`)}
                                    </DropdownMenuRadioItem>
                                );
                            })}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
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
