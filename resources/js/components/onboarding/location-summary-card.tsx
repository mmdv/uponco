import { MapPin, Pencil, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Location, SelectOption } from '@/types';

type Props = {
    location: Location;
    countries: SelectOption[];
    onEdit: () => void;
    /**
     * When provided, the card doubles as a picker: a checkbox is shown and the
     * whole card toggles selection. Omitted for the read-only review card.
     */
    selected?: boolean;
    onSelectedChange?: (selected: boolean) => void;
};

/**
 * A summary of a saved location showing its address — much like the public
 * booking address card — with a button to reopen the edit modal. Optionally
 * selectable, so the same card serves the review state and the picker.
 */
export default function LocationSummaryCard({
    location,
    countries,
    onEdit,
    selected,
    onSelectedChange,
}: Props) {
    const selectable = onSelectedChange !== undefined;

    const countryLabel =
        countries.find((country) => country.value === location.country)?.label ??
        location.country;

    const address = [
        location.street_address,
        location.unit,
        location.postal_code,
        location.city,
        countryLabel,
    ]
        .filter(Boolean)
        .join(', ');

    const content = (
        <>
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    {selectable && (
                        <Checkbox
                            checked={selected}
                            onCheckedChange={(checked) =>
                                onSelectedChange?.(checked === true)
                            }
                            onClick={(event) => event.stopPropagation()}
                            className="mt-1"
                        />
                    )}
                    <h3 className="min-w-0 text-lg font-semibold tracking-tight">
                        {location.name}
                    </h3>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                        event.stopPropagation();
                        onEdit();
                    }}
                    data-test="onboarding-location-edit-button"
                >
                    <Pencil />
                    Edit
                </Button>
            </div>

            <div
                className={cn(
                    'mt-4 space-y-3 text-sm',
                    selectable && 'ps-7',
                )}
            >
                {address && (
                    <div className="flex items-start gap-2.5">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <span className="text-foreground/90">{address}</span>
                    </div>
                )}
                {location.phone && (
                    <div className="flex items-center gap-2.5 font-medium">
                        <Phone className="size-4 shrink-0 text-muted-foreground" />
                        {location.phone}
                    </div>
                )}
            </div>
        </>
    );

    const className = cn(
        'rounded-2xl border border-[#f1f3f5] bg-card p-6 shadow-soft transition-colors dark:border-border',
        selectable && 'cursor-pointer hover:border-primary/40',
        selectable && selected && 'border-primary',
    );

    if (selectable) {
        return (
            <div
                data-test="onboarding-location-card"
                data-state={selected ? 'checked' : 'unchecked'}
                role="button"
                tabIndex={0}
                onClick={() => onSelectedChange?.(!selected)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectedChange?.(!selected);
                    }
                }}
                className={cn(
                    className,
                    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                )}
            >
                {content}
            </div>
        );
    }

    return (
        <div data-test="onboarding-location-card" className={className}>
            {content}
        </div>
    );
}
