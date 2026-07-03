import { Check } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { filterPreviewSlotsByDuration } from '@/lib/appointments';
import { cn } from '@/lib/utils';
import type { AppointmentSpecialistOption } from '@/types';

type Props = {
    specialists: AppointmentSpecialistOption[];
    selectedId: number | null;
    /** Duration (minutes) of the chosen service, used to filter preview slots. */
    serviceDuration: number | null;
    onSelect: (specialistId: number) => void;
};

/**
 * Build initials from a specialist's name for the avatar fallback.
 */
function initials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}

/**
 * The list of specialists. Each row previews the specialist's nearest working
 * day and a few of their work-hour time slots.
 */
export default function SpecialistPicker({
    specialists,
    selectedId,
    serviceDuration,
    onSelect,
}: Props) {
    if (specialists.length === 0) {
        return (
            <p className="px-1 py-6 text-center text-sm text-muted-foreground">
                No specialists available.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {specialists.map((specialist) => {
                const isSelected = specialist.id === selectedId;
                const preview = specialist.next_available;
                // Once a service is chosen, only show the openings long enough
                // to actually hold it (e.g. drop lone 30-min gaps for a 1h job).
                const slots =
                    preview && serviceDuration
                        ? filterPreviewSlotsByDuration(
                              preview.slots,
                              serviceDuration,
                          )
                        : (preview?.slots ?? []);

                return (
                    <button
                        key={specialist.id}
                        type="button"
                        onClick={() => onSelect(specialist.id)}
                        className={cn(
                            'flex w-full gap-3 rounded-xl border p-3 text-left transition-all duration-200',
                            isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/40',
                        )}
                    >
                        <Avatar className="size-11 shrink-0">
                            {specialist.avatar ? (
                                <AvatarImage
                                    src={specialist.avatar}
                                    alt={specialist.name}
                                    className="object-cover"
                                />
                            ) : null}
                            <AvatarFallback className="bg-muted text-xs font-medium">
                                {initials(specialist.name)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-medium">
                                    {specialist.name}
                                </p>
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

                            {preview && slots.length > 0 ? (
                                <div className="mt-1.5">
                                    <p className="text-xs text-muted-foreground">
                                        Next available · {preview.label}
                                    </p>
                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                        {slots.slice(0, 4).map((slot) => (
                                            <span
                                                key={slot}
                                                className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                                            >
                                                {slot}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-1 text-xs text-muted-foreground/70">
                                    No upcoming availability
                                </p>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
