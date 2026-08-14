import { Check, MapPin } from 'lucide-react';

import LocationDetails from '@/components/public-booking/location-details';
import { cn } from '@/lib/utils';
import type { AppointmentLocationDetail } from '@/types';

type Props = {
    locations: AppointmentLocationDetail[];
    selectedId: number | null;
    onSelect: (locationId: number) => void;
};

/**
 * A stacked list of the company's locations, each showing its address, phone
 * and directions link inline — two branches are usually told apart by where
 * they are, not by what they are called.
 */
export default function LocationPicker({
    locations,
    selectedId,
    onSelect,
}: Props) {
    if (locations.length === 0) {
        return (
            <p className="px-1 py-6 text-center text-sm text-muted-foreground">
                No locations available.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {locations.map((location) => {
                const isSelected = location.id === selectedId;

                return (
                    // A button can't contain the phone and directions links, so
                    // the row is a div with an explicit button role instead.
                    <div
                        key={location.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelect(location.id)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onSelect(location.id);
                            }
                        }}
                        className={cn(
                            'w-full cursor-pointer rounded-xl border p-3 text-left transition-all duration-200',
                            isSelected
                                ? 'border-primary bg-brand-accent'
                                : 'border-border hover:border-primary/40',
                        )}
                        data-test={`booking-location-${location.id}`}
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className={cn(
                                    'flex size-9 shrink-0 items-center justify-center rounded-full transition-colors',
                                    isSelected
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground',
                                )}
                            >
                                <MapPin className="size-4" />
                            </span>

                            <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                {location.name}
                            </span>

                            <span
                                className={cn(
                                    'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                                    isSelected
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-muted-foreground/30',
                                )}
                            >
                                {isSelected && <Check className="size-3" />}
                            </span>
                        </div>

                        <LocationDetails
                            location={location}
                            compact
                            className="mt-2 pl-12 text-xs"
                        />
                    </div>
                );
            })}
        </div>
    );
}
