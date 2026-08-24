import { CalendarDays, List } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import BookingCalendar from '@/components/public-booking/booking-calendar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import type { UpcomingDay } from '@/lib/appointments';
import { cn } from '@/lib/utils';
import type { AppointmentSlot } from '@/types';

type Props = {
    days: (UpcomingDay & { available: boolean })[];
    date: string;
    onDateChange: (date: string) => void;
    timezone: string;
    slots: AppointmentSlot[];
    loading: boolean;
    selectedStart: string;
    onSelectSlot: (start: string) => void;
    error?: string;
};

/**
 * Step two: pick a day from the horizontal strip, then a time slot. Time slots
 * are generated server-side for the chosen service, specialist and day.
 */
export default function StepDateTime({
    days,
    date,
    onDateChange,
    timezone,
    slots,
    loading,
    selectedStart,
    onSelectSlot,
    error,
}: Props) {
    const { t, locale } = useTranslation('booking');
    const [view, setView] = useState<'strip' | 'calendar'>('strip');
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

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        aria-label={
                            view === 'strip'
                                ? t('datetime.showCalendar')
                                : t('datetime.showAsList')
                        }
                        onClick={() =>
                            setView((current) =>
                                current === 'strip' ? 'calendar' : 'strip',
                            )
                        }
                    >
                        {view === 'strip' ? (
                            <CalendarDays className="size-4" />
                        ) : (
                            <List className="size-4" />
                        )}
                    </Button>
                </div>

                {view === 'calendar' ? (
                    <BookingCalendar
                        selectedDate={date}
                        availableDays={availableDays}
                        onSelectDay={onDateChange}
                    />
                ) : (
                    <div className="-mx-1 flex [scrollbar-width:thin] [scrollbar-color:var(--color-primary)_transparent] gap-2 overflow-x-auto px-1 pt-1 pb-3 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/70 [&::-webkit-scrollbar-track]:bg-transparent">
                        {days.map((day) => {
                            const isSelected = day.date === date;

                            return (
                                <button
                                    key={day.date}
                                    type="button"
                                    disabled={!day.available}
                                    onClick={() => onDateChange(day.date)}
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
                )}
            </section>

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
                    <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
                        {t('datetime.noTimes')}
                    </p>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {visibleSlots.map((slot) => {
                            const isSelected = slot.start === selectedStart;
                            const isFull = slot.remaining === 0;

                            return (
                                <button
                                    key={slot.start}
                                    type="button"
                                    disabled={isFull}
                                    onClick={() => onSelectSlot(slot.start)}
                                    data-test={`booking-slot-${slot.label.replace(':', '')}`}
                                    className={cn(
                                        'flex flex-col items-center rounded-lg border py-2 text-sm font-medium transition-all duration-200',
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

                <InputError message={error} />
            </section>
        </div>
    );
}
