import { CalendarDays } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import BookingCalendar from '@/components/public-booking-v2/booking-calendar';
import { useBooking } from '@/components/public-booking-v2/booking-context';
import ErrorAlert from '@/components/public-booking-v2/error-alert';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { brandStyle } from '@/lib/brand';
import { cn } from '@/lib/utils';

type Props = {
    timezone: string;
};

/**
 * Step two: pick a day from the horizontal strip, then a time slot. Time slots
 * are generated server-side for the chosen service, specialist and day.
 */
export default function StepDateTime({ timezone }: Props) {
    const {
        company,
        upcomingDays: days,
        date,
        handleDateChange: onDateChange,
        availableSlots: slots,
        slotsLoading: loading,
        selectedStart,
        handleSelectSlot,
        errors,
        clearErrors,
    } = useBooking();
    const error = errors.start_at;
    // Picking another time answers the "that slot was taken" error.
    const onSelectSlot = (start: string) => {
        clearErrors(['start_at']);
        handleSelectSlot(start);
    };
    const { t, locale } = useTranslation('booking');
    const [calendarOpen, setCalendarOpen] = useState(false);
    const stripRef = useRef<HTMLDivElement>(null);

    // Keep the chosen day in view on the strip — a day picked from the
    // calendar may sit weeks along it.
    useEffect(() => {
        stripRef.current
            ?.querySelector('[data-selected="true"]')
            ?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
    }, [date]);
    const timeFormatter = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
    });

    // The day strip's weekday/month labels come from bundled translation lists
    // indexed by day-of-week / month number, not from `Intl` — embedded webviews
    // often ship without the visitor's locale data and silently fall back to
    // English (or worse) for `Intl` date parts. The `YYYY-MM-DD` value is parsed
    // as a local calendar date so the weekday can't drift a day across timezones.
    const parseLocalDate = (value: string): Date => {
        const [year, month, day] = value.split('-').map(Number);

        return new Date(year, month - 1, day);
    };
    const weekdayLabel = (value: string): string =>
        t(`datetime.weekdays.${parseLocalDate(value).getDay()}`);
    const monthLabel = (value: string): string =>
        t(`datetime.months.${parseLocalDate(value).getMonth()}`);

    // Bookable slots plus full group sessions, which are shown disabled so the
    // visitor can see the session existed. Past / specialist-blocked slots stay
    // hidden as before (they are unavailable with seats still nominally left).
    const visibleSlots = slots.filter(
        (slot) => slot.available || slot.remaining === 0,
    );

    // The strip is built out to the last available day, so its bookable entries
    // are the full set the calendar needs to highlight.
    const availableDays = days
        .filter((day) => day.available)
        .map((day) => day.date);

    // Name the chosen day in the heading (e.g. "26 August") so it is clear which
    // day the times below belong to; fall back to the prompt until one is picked.
    const chosenDate = parseLocalDate(date);
    const dayHeading = date
        ? `${chosenDate.getDate()} ${t(`datetime.monthsLong.${chosenDate.getMonth()}`)}`
        : t('datetime.chooseDay');

    return (
        <div className="space-y-6">
            <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-medium">{dayHeading}</h2>

                    {/*
                     * A popover rather than swapping out the strip: on a phone
                     * the full calendar pushed the times off screen, so picking
                     * a day changed things the visitor could no longer see.
                     */}
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-8"
                                aria-label={t('datetime.showCalendar')}
                                data-test="booking-calendar-toggle"
                            >
                                <CalendarDays className="size-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="end"
                            className="w-[min(20rem,calc(100vw-2rem))] p-3"
                            // Portalled out of the page's brand scope.
                            style={brandStyle(company.brand)}
                        >
                            <BookingCalendar
                                selectedDate={date}
                                availableDays={availableDays}
                                onSelectDay={(day) => {
                                    onDateChange(day);
                                    setCalendarOpen(false);
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div
                    ref={stripRef}
                    className="-mx-1 flex [scrollbar-width:thin] [scrollbar-color:var(--color-primary)_transparent] gap-2 overflow-x-auto px-1 pt-1 pb-3 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/70 [&::-webkit-scrollbar-track]:bg-transparent"
                >
                    {days.map((day) => {
                        const isSelected = day.date === date;

                        return (
                            <button
                                key={day.date}
                                type="button"
                                disabled={!day.available}
                                onClick={() => onDateChange(day.date)}
                                data-selected={isSelected}
                                data-test={`booking-day-${day.date}`}
                                className={cn(
                                    'flex w-14 shrink-0 flex-col items-center rounded-xl border py-2.5 transition-all duration-200',
                                    isSelected
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-card hover:border-primary/40',
                                    !day.available &&
                                        'cursor-not-allowed opacity-40 hover:border-border',
                                )}
                            >
                                <span
                                    className={cn(
                                        'text-[11px]',
                                        isSelected
                                            ? 'text-primary-foreground/80'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {day.isToday
                                        ? t('datetime.today')
                                        : day.isTomorrow
                                          ? t('datetime.tomorrow')
                                          : weekdayLabel(day.date)}
                                </span>
                                <span className="text-lg font-semibold">
                                    {day.day}
                                </span>
                                <span
                                    className={cn(
                                        'text-[11px]',
                                        isSelected
                                            ? 'text-primary-foreground/80'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {monthLabel(day.date)}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {error && (
                <ErrorAlert
                    title={t('v2.errors.slot')}
                    data-test="booking-slot-error"
                >
                    {error}
                </ErrorAlert>
            )}

            <section className="space-y-3">
                <h2 className="text-sm font-medium">
                    {t('datetime.chooseTime')}
                </h2>

                {loading ? (
                    <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 9 }).map((_, index) => (
                            <Skeleton key={index} className="h-10 w-full" />
                        ))}
                    </div>
                ) : visibleSlots.length === 0 ? (
                    <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground motion-safe:animate-rise-in">
                        {t('datetime.noTimes')}
                    </p>
                ) : (
                    // Keyed by day so a new day's times stagger in afresh.
                    <div key={date} className="grid grid-cols-3 gap-2">
                        {visibleSlots.map((slot, index) => {
                            const isSelected = slot.start === selectedStart;
                            const isFull = slot.remaining === 0;

                            return (
                                <button
                                    key={slot.start}
                                    type="button"
                                    disabled={isFull}
                                    onClick={() => onSelectSlot(slot.start)}
                                    data-test={`booking-slot-${slot.label.replace(':', '')}`}
                                    style={{
                                        animationDelay: `${Math.min(index, 18) * 20}ms`,
                                    }}
                                    className={cn(
                                        'flex flex-col items-center rounded-lg border py-2 text-sm font-medium tabular-nums transition-all duration-200 active:scale-95 motion-safe:animate-rise-in',
                                        isSelected
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-card hover:border-primary/40',
                                        isFull &&
                                            'cursor-not-allowed opacity-40 hover:border-border',
                                    )}
                                >
                                    <span
                                        className={cn(isFull && 'line-through')}
                                    >
                                        {timeFormatter.format(
                                            new Date(slot.start),
                                        )}
                                    </span>

                                    {slot.remaining !== null && (
                                        <span
                                            className={cn(
                                                'text-[11px] font-normal',
                                                isSelected
                                                    ? 'text-primary-foreground/80'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {isFull
                                                ? t('datetime.fullyBooked')
                                                : t('datetime.left', {
                                                      count: slot.remaining,
                                                  })}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
