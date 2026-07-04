import { useMemo } from 'react';

import {
    appointmentDateKey,
    dateKey,
    formatMinutes,
    minutesFromMidnight,
    monthGridDays,
} from '@/lib/calendar-grid';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_VISIBLE = 3;

type Props = {
    date: Date;
    appointments: Appointment[];
    timezone: string;
    onSelectAppointment: (appointment: Appointment) => void;
    onSelectDay: (day: Date) => void;
};

export default function CalendarMonthView({
    date,
    appointments,
    timezone,
    onSelectAppointment,
    onSelectDay,
}: Props) {
    const days = useMemo(() => monthGridDays(date), [date]);
    const todayKey = dateKey(new Date());
    const currentMonth = date.getMonth();

    const byDay = useMemo(() => {
        const map = new Map<string, Appointment[]>();

        for (const appointment of appointments) {
            const key = appointmentDateKey(appointment, timezone);
            const bucket = map.get(key);

            if (bucket) {
                bucket.push(appointment);
            } else {
                map.set(key, [appointment]);
            }
        }

        for (const bucket of map.values()) {
            bucket.sort(
                (a, b) =>
                    minutesFromMidnight(a.start_at, timezone) -
                    minutesFromMidnight(b.start_at, timezone),
            );
        }

        return map;
    }, [appointments, timezone]);

    return (
        <div className="overflow-hidden rounded-lg border">
            {/* Weekday header */}
            <div className="grid grid-cols-7 border-b bg-muted/40">
                {WEEKDAY_LABELS.map((label) => (
                    <div
                        key={label}
                        className="py-2 text-center text-xs font-medium text-muted-foreground"
                    >
                        {label}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
                {days.map((day) => {
                    const key = dateKey(day);
                    const dayAppointments = byDay.get(key) ?? [];
                    const isToday = key === todayKey;
                    const isCurrentMonth = day.getMonth() === currentMonth;
                    const overflow = dayAppointments.length - MAX_VISIBLE;

                    return (
                        <div
                            key={key}
                            className={cn(
                                'min-h-28 border-b border-r p-1.5 [&:nth-child(7n)]:border-r-0',
                                !isCurrentMonth && 'bg-muted/20',
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => onSelectDay(day)}
                                className={cn(
                                    'mb-1 flex size-6 items-center justify-center rounded-full text-xs font-medium transition-colors hover:bg-muted',
                                    isToday &&
                                        'bg-primary text-primary-foreground hover:bg-primary',
                                    !isCurrentMonth && 'text-muted-foreground',
                                )}
                            >
                                {day.getDate()}
                            </button>

                            <div className="space-y-1">
                                {dayAppointments
                                    .slice(0, MAX_VISIBLE)
                                    .map((appointment) => (
                                        <button
                                            key={appointment.id}
                                            type="button"
                                            data-test="calendar-appointment"
                                            onClick={() =>
                                                onSelectAppointment(appointment)
                                            }
                                            className="flex w-full items-center gap-1 overflow-hidden rounded bg-primary/10 px-1 py-0.5 text-left text-[11px] leading-tight hover:bg-primary/20"
                                        >
                                            <span className="font-medium text-muted-foreground">
                                                {formatMinutes(
                                                    minutesFromMidnight(
                                                        appointment.start_at,
                                                        timezone,
                                                    ),
                                                )}
                                            </span>
                                            <span className="truncate text-foreground">
                                                {appointment.service.title}
                                            </span>
                                        </button>
                                    ))}

                                {overflow > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => onSelectDay(day)}
                                        className="px-1 text-[11px] text-muted-foreground hover:text-foreground"
                                    >
                                        +{overflow} more
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
