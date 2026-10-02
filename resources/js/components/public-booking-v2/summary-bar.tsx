import { CalendarClock, MapPin, Pencil, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useBooking } from '@/components/public-booking-v2/booking-context';
import { useTranslation } from '@/hooks/use-translation';

type Props = {
    /** Takes the visitor back to the hub to change any of it. */
    onEdit: () => void;
    /**
     * Whether to add the date & time line. Off while it is being picked, where
     * a line appearing on the first tap would shove the slots down.
     */
    showWhen?: boolean;
};

type Part = {
    icon: LucideIcon;
    value: string;
    /** Secondary detail after the value, e.g. "1h · 50 AZN". */
    detail?: string;
};

/**
 * The booking so far, in at most three short lines at the chip size of the
 * classic summary: what (service, duration, price), who and where, and when.
 * The whole card is one button back to the hub, so nothing needs its own
 * "change" link.
 */
export default function SummaryBar({ onEdit, showWhen = true }: Props) {
    const { summary, serviceIcon } = useBooking();
    const { t } = useTranslation('booking');
    const {
        serviceTitle,
        metaLabel,
        specialistName,
        locationName,
        dateTimeLabel,
    } = summary;

    const lines: Part[][] = [
        serviceTitle
            ? [{ icon: serviceIcon, value: serviceTitle, detail: metaLabel }]
            : [],
        [
            ...(specialistName ? [{ icon: User, value: specialistName }] : []),
            ...(locationName ? [{ icon: MapPin, value: locationName }] : []),
        ],
        showWhen && dateTimeLabel
            ? [{ icon: CalendarClock, value: dateTimeLabel }]
            : [],
    ].filter((line) => line.length > 0);

    return (
        <button
            type="button"
            onClick={onEdit}
            aria-label={t('v2.summary.edit')}
            data-test="booking-summary-bar"
            className="group flex w-full animate-in items-start gap-2 rounded-xl border bg-card px-3 py-2 text-left text-xs shadow-xs transition-colors duration-300 fade-in-0 hover:border-primary/40"
        >
            <div className="min-w-0 flex-1 space-y-1">
                {lines.map((parts, index) => (
                    <div
                        key={index}
                        className="flex min-w-0 items-center gap-3"
                    >
                        {parts.map((part) => (
                            <span
                                key={part.value}
                                className="flex min-w-0 items-center gap-1.5"
                            >
                                <part.icon className="size-3.5 shrink-0 text-primary" />
                                <span className="truncate font-medium">
                                    {part.value}
                                    {part.detail && (
                                        <span className="font-normal text-muted-foreground">
                                            {` · ${part.detail}`}
                                        </span>
                                    )}
                                </span>
                            </span>
                        ))}
                    </div>
                ))}
            </div>

            <Pencil className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        </button>
    );
}
