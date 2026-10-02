import { Apple, Calendar, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';

import BookingSummary from '@/components/public-booking-v2/booking-summary';
import Confetti from '@/components/public-booking-v2/confetti';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import type { CalendarEvent } from '@/lib/calendar';
import { buildGoogleCalendarUrl, downloadIcsFile } from '@/lib/calendar';

type Props = {
    companyName: string;
    customerName: string;
    summary: {
        serviceTitle?: string;
        metaLabel?: string;
        specialistName?: string;
        locationName?: string | null;
        dateTimeLabel?: string;
    };
    calendar: CalendarEvent | null;
    /** The business category's icon, passed straight through to the summary. */
    serviceIcon?: LucideIcon;
    onBookAnother: () => void;
};

/** Each block rises in after the one above it, once the tick has landed. */
const after = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

/**
 * The confirmation after a booking is created: the badge pops in, its tick
 * draws itself, a ring pulses out and confetti bursts behind it, then the
 * message, the booking and the next actions rise in one after another. With
 * reduced motion it is simply the finished screen.
 */
export default function SuccessScreen({
    companyName,
    customerName,
    summary,
    calendar,
    serviceIcon,
    onBookAnother,
}: Props) {
    const { t } = useTranslation('booking');

    return (
        <div
            className="flex flex-col items-center px-1 pt-4 pb-6 text-center"
            data-test="booking-success"
        >
            <div className="relative flex size-40 items-center justify-center">
                <span
                    aria-hidden
                    className="absolute size-24 rounded-full bg-primary/30 motion-safe:animate-ring-pulse motion-reduce:hidden"
                />
                <Confetti />

                <span className="relative flex size-24 items-center justify-center rounded-full bg-primary-gradient text-primary-foreground shadow-xl shadow-primary/30 motion-safe:animate-pop-in">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="size-12"
                        aria-hidden
                    >
                        <path
                            d="M5 12.5l4.5 4.5L19 7.5"
                            pathLength={1}
                            stroke="currentColor"
                            strokeWidth={2.6}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ strokeDasharray: 1 }}
                            className="motion-safe:animate-check-draw"
                        />
                    </svg>
                </span>
            </div>

            <h1
                className="text-2xl font-semibold tracking-tight motion-safe:animate-rise-in"
                style={after(550)}
            >
                {t('success.title')}
            </h1>
            <p
                className="mt-2 max-w-xs text-sm text-muted-foreground motion-safe:animate-rise-in"
                style={after(650)}
            >
                {t('success.message', {
                    name: customerName.split(' ')[0] || t('success.there'),
                    company: companyName,
                })}
            </p>

            <div
                className="mt-7 w-full space-y-2 text-left motion-safe:animate-rise-in"
                style={after(750)}
            >
                <p className="px-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {t('v2.success.summaryTitle')}
                </p>
                <BookingSummary {...summary} serviceIcon={serviceIcon} />
            </div>

            {calendar && (
                <div
                    className="mt-6 w-full space-y-2 text-left motion-safe:animate-rise-in"
                    style={after(850)}
                >
                    <p className="px-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                        {t('success.addToCalendar')}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="h-11" asChild>
                            <a
                                href={buildGoogleCalendarUrl(calendar)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Calendar className="size-4" />
                                {t('success.google')}
                            </a>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11"
                            onClick={() => downloadIcsFile(calendar)}
                        >
                            <Apple className="size-4" />
                            {t('success.apple')}
                        </Button>
                    </div>
                </div>
            )}

            <Button
                variant="ghost"
                className="mt-4 h-12 w-full text-base motion-safe:animate-rise-in"
                style={after(950)}
                onClick={onBookAnother}
                data-test="booking-book-another"
            >
                <Plus className="size-4" />
                {t('success.bookAnother')}
            </Button>
        </div>
    );
}
