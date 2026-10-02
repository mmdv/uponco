import { Check, Info } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
import SpecialistProfileDialog from '@/components/public-booking-v2/specialist-profile-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/use-translation';
import { filterPreviewSlotsByDuration, nameInitials } from '@/lib/appointments';
import { matchesSearch } from '@/lib/booking-search';
import { cn } from '@/lib/utils';
import type { AppointmentSpecialistOption } from '@/types';

type Props = {
    specialists: AppointmentSpecialistOption[];
    selectedId: number | null;
    /** Duration (minutes) of the chosen service, used to filter preview slots. */
    serviceDuration: number | null;
    onSelect: (specialistId: number) => void;
    filters?: PickerFilter[];
    autoFocus?: boolean;
};

/**
 * Searchable specialist list. Each row previews the specialist's nearest
 * working day and a few openings, plus an info button that opens their public
 * profile without selecting them.
 */
export default function SpecialistPicker({
    specialists,
    selectedId,
    serviceDuration,
    onSelect,
    filters = [],
    autoFocus = false,
}: Props) {
    const { t } = useTranslation('booking');
    const [query, setQuery] = useState('');
    const [profile, setProfile] = useState<AppointmentSpecialistOption | null>(
        null,
    );
    const listRef = useRef<HTMLDivElement>(null);

    const visible = specialists.filter((specialist) =>
        matchesSearch([specialist.name, specialist.job_title], query),
    );

    useEffect(() => scrollSelectedIntoView(listRef.current), []);

    const toolbar = (
        <>
            <SearchField
                value={query}
                onChange={setQuery}
                placeholder={t('v2.picker.searchSpecialists')}
                autoFocus={autoFocus}
                data-test="booking-specialist-search"
            />
            <FilterChips filters={filters} />
        </>
    );

    return (
        <PickerLayout toolbar={toolbar} listRef={listRef}>
            {specialists.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                    {t('selection.noSpecialists')}
                </p>
            ) : visible.length === 0 ? (
                <PickerEmpty query={query} onClear={() => setQuery('')} />
            ) : (
                <div className="space-y-2 pt-3">
                    {visible.map((specialist, index) => {
                        const isSelected = specialist.id === selectedId;
                        const preview = specialist.next_available;
                        // Once a service is chosen, only show openings long
                        // enough to actually hold it.
                        const slots =
                            preview && serviceDuration
                                ? filterPreviewSlotsByDuration(
                                      preview.slots,
                                      serviceDuration,
                                  )
                                : (preview?.slots ?? []);

                        return (
                            // A plain button can't wrap the nested info button,
                            // so the row itself carries the button role.
                            <div
                                key={specialist.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => onSelect(specialist.id)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === 'Enter' ||
                                        event.key === ' '
                                    ) {
                                        event.preventDefault();
                                        onSelect(specialist.id);
                                    }
                                }}
                                data-selected={isSelected}
                                data-test={`booking-specialist-${specialist.id}`}
                                style={staggerStyle(index)}
                                className={cn(
                                    'group flex w-full cursor-pointer gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-primary/20 active:scale-[0.99] motion-safe:animate-rise-in',
                                    isSelected
                                        ? 'border-primary bg-brand-accent ring-1 ring-primary'
                                        : 'border-border bg-card hover:border-primary/40 hover:shadow-sm',
                                )}
                            >
                                <Avatar className="size-12 shrink-0">
                                    {specialist.avatar ? (
                                        <AvatarImage
                                            src={specialist.avatar}
                                            alt={specialist.name}
                                            className="object-cover"
                                        />
                                    ) : null}
                                    <AvatarFallback className="bg-muted text-sm font-medium">
                                        {nameInitials(specialist.name)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                <Highlight
                                                    text={specialist.name}
                                                    query={query}
                                                />
                                            </p>
                                            {specialist.job_title && (
                                                <p className="truncate text-xs text-muted-foreground">
                                                    <Highlight
                                                        text={
                                                            specialist.job_title
                                                        }
                                                        query={query}
                                                    />
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex shrink-0 items-center gap-1.5">
                                            <button
                                                type="button"
                                                aria-label={t(
                                                    'specialist.about',
                                                    {
                                                        name: specialist.name,
                                                    },
                                                )}
                                                data-test={`specialist-info-${specialist.id}`}
                                                onClick={(event) => {
                                                    // Reading the bio must never
                                                    // pick the specialist.
                                                    event.stopPropagation();
                                                    setProfile(specialist);
                                                }}
                                                onKeyDown={(event) =>
                                                    event.stopPropagation()
                                                }
                                                className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                            >
                                                <Info className="size-4" />
                                            </button>

                                            <span
                                                className={cn(
                                                    'flex size-6 items-center justify-center rounded-full border transition-all duration-200',
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
                                    </div>

                                    {preview && slots.length > 0 ? (
                                        <div className="mt-2">
                                            <p className="text-xs text-muted-foreground">
                                                {t('specialist.nextAvailable', {
                                                    label: preview.label,
                                                })}
                                            </p>
                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                                {slots
                                                    .slice(0, 4)
                                                    .map((slot) => (
                                                        <span
                                                            key={slot}
                                                            className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground tabular-nums"
                                                        >
                                                            {slot}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-xs text-muted-foreground/70">
                                            {t('specialist.noAvailability')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <SpecialistProfileDialog
                specialist={profile}
                onClose={() => setProfile(null)}
            />
        </PickerLayout>
    );
}
