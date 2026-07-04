import { useMemo } from 'react';

import {
    dateKey,
    formatMinutes,
    GRID_END_MINUTES,
    GRID_HEIGHT,
    GRID_START_HOUR,
    GRID_START_MINUTES,
    HOUR_HEIGHT,
    minutesFromMidnight,
    positionAppointments,
    weekDays,
} from '@/lib/calendar-grid';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types';

const HOURS = Array.from(
    { length: GRID_END_MINUTES / 60 - GRID_START_HOUR + 1 },
    (_, index) => GRID_START_HOUR + index,
);

const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
});

type Props = {
    date: Date;
    appointments: Appointment[];
    timezone: string;
    onSelectAppointment: (appointment: Appointment) => void;
};

export default function CalendarWeekView({
    date,
    appointments,
    timezone,
    onSelectAppointment,
}: Props) {
    const days = useMemo(() => weekDays(date), [date]);
    const todayKey = dateKey(new Date());

    return (
        <div className="overflow-x-auto rounded-lg border">
            <div className="min-w-[720px]">
                {/* Day headers */}
                <div className="flex border-b">
                    <div className="w-16 shrink-0 border-r" />
                    {days.map((day) => {
                        const key = dateKey(day);
                        const isToday = key === todayKey;

                        return (
                            <div
                                key={key}
                                className="flex-1 border-r py-2 text-center last:border-r-0"
                            >
                                <p className="text-xs text-muted-foreground">
                                    {weekdayFormatter.format(day)}
                                </p>
                                <p
                                    className={cn(
                                        'mx-auto mt-0.5 flex size-7 items-center justify-center rounded-full text-sm font-medium',
                                        isToday &&
                                            'bg-primary text-primary-foreground',
                                    )}
                                >
                                    {day.getDate()}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Time grid */}
                <div className="flex">
                    {/* Hour gutter */}
                    <div className="w-16 shrink-0 border-r">
                        <div
                            style={{ height: GRID_HEIGHT }}
                            className="relative"
                        >
                            {HOURS.slice(0, -1).map((hour, index) => (
                                <div
                                    key={hour}
                                    className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground"
                                    style={{ top: index * HOUR_HEIGHT }}
                                >
                                    {index === 0 ? '' : formatMinutes(hour * 60)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Day columns */}
                    {days.map((day) => {
                        const key = dateKey(day);
                        const positioned = positionAppointments(
                            appointments,
                            key,
                            timezone,
                        );
                        const nowMinutes =
                            key === todayKey
                                ? minutesFromMidnight(
                                      new Date().toISOString(),
                                      timezone,
                                  )
                                : null;

                        return (
                            <div
                                key={key}
                                className="relative flex-1 border-r last:border-r-0"
                                style={{ height: GRID_HEIGHT }}
                            >
                                {HOURS.map((hour, index) => (
                                    <div
                                        key={hour}
                                        className="absolute inset-x-0 border-t border-border/60"
                                        style={{ top: index * HOUR_HEIGHT }}
                                    />
                                ))}

                                {nowMinutes !== null &&
                                    nowMinutes >= GRID_START_MINUTES &&
                                    nowMinutes <= GRID_END_MINUTES && (
                                        <div
                                            className="absolute inset-x-0 z-20 h-px bg-red-500"
                                            style={{
                                                top:
                                                    ((nowMinutes -
                                                        GRID_START_MINUTES) /
                                                        60) *
                                                    HOUR_HEIGHT,
                                            }}
                                        />
                                    )}

                                {positioned.map((item) => (
                                    <button
                                        key={item.appointment.id}
                                        type="button"
                                        data-test="calendar-appointment"
                                        onClick={() =>
                                            onSelectAppointment(item.appointment)
                                        }
                                        className="absolute z-10 overflow-hidden rounded border border-primary/30 bg-primary/10 px-1 py-0.5 text-left text-[11px] leading-tight hover:shadow-md"
                                        style={{
                                            top: item.top,
                                            height: item.height,
                                            left: `calc(${item.left * 100}% + 2px)`,
                                            width: `calc(${item.width * 100}% - 4px)`,
                                        }}
                                    >
                                        <p className="font-medium text-foreground">
                                            {formatMinutes(item.startMinutes)}
                                        </p>
                                        <p className="truncate text-foreground">
                                            {item.appointment.service.title}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
