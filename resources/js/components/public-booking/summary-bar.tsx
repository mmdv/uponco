import { CalendarClock, MapPin, Sparkles, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { GENERIC_SERVICE_ICON } from '@/lib/business-category-icons';

type Chip = {
    icon: LucideIcon;
    value: string;
};

type Props = {
    serviceTitle?: string;
    metaLabel?: string;
    specialistName?: string;
    locationName?: string | null;
    dateTimeLabel?: string;
    /** Stands for what the business does; defaults to the generic service icon. */
    serviceIcon?: LucideIcon;
};

/**
 * A live, inline recap of the booking shown at the top of the flow. Each choice
 * pops in as a pill as the user makes it, so it doubles as both progress and
 * summary without a separate stepper.
 */
export default function SummaryBar({
    serviceTitle,
    specialistName,
    locationName,
    dateTimeLabel,
    serviceIcon = GENERIC_SERVICE_ICON,
}: Props) {
    const chips: Chip[] = [];

    if (serviceTitle) {
        chips.push({ icon: serviceIcon, value: serviceTitle });
    }

    if (specialistName) {
        chips.push({ icon: User, value: specialistName });
    }

    if (locationName) {
        chips.push({ icon: MapPin, value: locationName });
    }

    if (dateTimeLabel) {
        chips.push({ icon: CalendarClock, value: dateTimeLabel });
    }

    if (chips.length === 0) {
        return (
            <div className="flex min-h-[3.5rem] items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/40 px-3 text-xs text-muted-foreground">
                <Sparkles className="size-3.5" />
                Let&apos;s build your booking
            </div>
        );
    }

    return (
        <div className="flex min-h-[3.5rem] flex-wrap content-start items-start gap-1.5">
            {chips.map((chip) => (
                <span
                    key={chip.value}
                    className="inline-flex max-w-full animate-in items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-xs font-medium shadow-xs duration-300 fade-in-0 zoom-in-95"
                >
                    <chip.icon className="size-3.5 shrink-0 text-primary" />
                    <span className="truncate">{chip.value}</span>
                </span>
            ))}
        </div>
    );
}
