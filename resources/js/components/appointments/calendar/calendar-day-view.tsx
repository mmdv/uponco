import { GripVertical } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { formatAppointmentTimeRange } from '@/lib/appointments';
import {
    appointmentDuration,
    dateKey,
    formatMinutes,
    GRID_END_MINUTES,
    GRID_HEIGHT,
    GRID_START_HOUR,
    GRID_START_MINUTES,
    HOUR_HEIGHT,
    minutesFromMidnight,
    positionAppointments,
    SLOT_MINUTES,
    wallTimeToUtcIso,
    wouldOverlap,
} from '@/lib/calendar-grid';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types';

const HOURS = Array.from(
    { length: GRID_END_MINUTES / 60 - GRID_START_HOUR + 1 },
    (_, index) => GRID_START_HOUR + index,
);

/** Current epoch ms. Wrapped so the impure read stays out of render scope. */
function nowMs(): number {
    return Date.now();
}

type DragState = {
    appointment: Appointment;
    duration: number;
    /** Pixels between the pointer and the top of the block when grabbed. */
    grabOffset: number;
};

type DropState = {
    minutes: number;
    valid: boolean;
};

type Props = {
    date: Date;
    appointments: Appointment[];
    timezone: string;
    onSelectAppointment: (appointment: Appointment) => void;
    onReschedule: (appointment: Appointment, startIso: string) => void;
};

export default function CalendarDayView({
    date,
    appointments,
    timezone,
    onSelectAppointment,
    onReschedule,
}: Props) {
    const gridRef = useRef<HTMLDivElement>(null);
    const [drag, setDrag] = useState<DragState | null>(null);
    const [drop, setDrop] = useState<DropState | null>(null);

    const dayKey = dateKey(date);

    const positioned = useMemo(
        () => positionAppointments(appointments, dayKey, timezone),
        [appointments, dayKey, timezone],
    );

    const nowMinutes = useMemo(() => {
        if (dayKey !== dateKey(new Date())) {
            return null;
        }

        const minutes = minutesFromMidnight(new Date().toISOString(), timezone);

        if (minutes < GRID_START_MINUTES || minutes > GRID_END_MINUTES) {
            return null;
        }

        return minutes;
    }, [dayKey, timezone]);

    const evaluateDrop = (
        minutes: number,
        state: DragState,
        now: number,
    ): DropState => {
        const end = minutes + state.duration;
        const startIso = wallTimeToUtcIso(dayKey, minutes, timezone);
        const isPast = new Date(startIso).getTime() < now;

        const valid =
            minutes >= GRID_START_MINUTES &&
            end <= GRID_END_MINUTES &&
            !isPast &&
            !wouldOverlap(
                state.appointment,
                dayKey,
                minutes,
                appointments,
                timezone,
            );

        return { minutes, valid };
    };

    /** Convert the pointer position into a snapped, clamped start minute. */
    const minutesForPointer = (clientY: number, state: DragState): number => {
        const rect = gridRef.current?.getBoundingClientRect();

        if (!rect) {
            return GRID_START_MINUTES;
        }

        const topPx = clientY - rect.top - state.grabOffset;
        const raw = GRID_START_MINUTES + (topPx / HOUR_HEIGHT) * 60;
        const snapped = Math.round(raw / SLOT_MINUTES) * SLOT_MINUTES;

        return Math.min(
            Math.max(snapped, GRID_START_MINUTES),
            GRID_END_MINUTES - state.duration,
        );
    };

    const beginDrag = (
        event: React.PointerEvent,
        item: { appointment: Appointment; top: number },
    ) => {
        // Only respond to the primary button / touch, never a right-click.
        if (event.button !== 0) {
            return;
        }

        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);

        const rect = gridRef.current?.getBoundingClientRect();
        const grabOffset = rect ? event.clientY - rect.top - item.top : 0;

        const state: DragState = {
            appointment: item.appointment,
            duration: appointmentDuration(item.appointment),
            grabOffset,
        };

        setDrag(state);
        setDrop(
            evaluateDrop(
                minutesForPointer(event.clientY, state),
                state,
                nowMs(),
            ),
        );
    };

    const moveDrag = (event: React.PointerEvent) => {
        if (!drag) {
            return;
        }

        setDrop(
            evaluateDrop(minutesForPointer(event.clientY, drag), drag, nowMs()),
        );
    };

    const endDrag = (event: React.PointerEvent) => {
        if (!drag) {
            return;
        }

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        const result = evaluateDrop(
            minutesForPointer(event.clientY, drag),
            drag,
            nowMs(),
        );

        if (result.valid) {
            onReschedule(
                drag.appointment,
                wallTimeToUtcIso(dayKey, result.minutes, timezone),
            );
        }

        setDrag(null);
        setDrop(null);
    };

    return (
        <div className="overflow-hidden rounded-lg border select-none">
            <div className="flex">
                {/* Hour gutter */}
                <div className="w-16 shrink-0 border-r">
                    <div style={{ height: GRID_HEIGHT }} className="relative">
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

                {/* Time grid */}
                <div
                    ref={gridRef}
                    className="relative flex-1"
                    style={{ height: GRID_HEIGHT }}
                >
                    {/* Hour lines */}
                    {HOURS.map((hour, index) => (
                        <div
                            key={hour}
                            className="absolute inset-x-0 border-t border-border/60"
                            style={{ top: index * HOUR_HEIGHT }}
                        />
                    ))}

                    {/* Current-time indicator */}
                    {nowMinutes !== null && (
                        <div
                            className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
                            style={{
                                top:
                                    ((nowMinutes - GRID_START_MINUTES) / 60) *
                                    HOUR_HEIGHT,
                            }}
                        >
                            <div className="size-2 -translate-x-1/2 rounded-full bg-red-500" />
                            <div className="h-px flex-1 bg-red-500" />
                        </div>
                    )}

                    {/* Drop indicator */}
                    {drag && drop && (
                        <div
                            className={cn(
                                'pointer-events-none absolute inset-x-1 z-30 rounded-md border-2 border-dashed',
                                drop.valid
                                    ? 'border-emerald-500 bg-emerald-500/10'
                                    : 'border-red-500 bg-red-500/10',
                            )}
                            style={{
                                top:
                                    ((drop.minutes - GRID_START_MINUTES) / 60) *
                                    HOUR_HEIGHT,
                                height: (drag.duration / 60) * HOUR_HEIGHT,
                            }}
                        >
                            <span className="px-2 text-xs font-medium">
                                {formatMinutes(drop.minutes)}
                                {!drop.valid && ' · unavailable'}
                            </span>
                        </div>
                    )}

                    {/* Appointments */}
                    {positioned.map((item) => {
                        const isDragged =
                            drag?.appointment.id === item.appointment.id;

                        return (
                            <div
                                key={item.appointment.id}
                                data-test="calendar-appointment"
                                className={cn(
                                    'absolute z-10 flex overflow-hidden rounded-md border border-primary/30 bg-primary/10 text-xs shadow-sm transition-shadow',
                                    isDragged && 'opacity-40',
                                )}
                                style={{
                                    top: item.top,
                                    height: item.height,
                                    left: `calc(${item.left * 100}% + 4px)`,
                                    width: `calc(${item.width * 100}% - 8px)`,
                                }}
                            >
                                {/* Drag handle */}
                                <button
                                    type="button"
                                    aria-label="Drag to reschedule"
                                    data-test="calendar-appointment-handle"
                                    onPointerDown={(event) =>
                                        beginDrag(event, item)
                                    }
                                    onPointerMove={moveDrag}
                                    onPointerUp={endDrag}
                                    onPointerCancel={endDrag}
                                    className={cn(
                                        'flex w-5 shrink-0 touch-none items-center justify-center border-r border-primary/20 bg-primary/15 text-primary/70 hover:bg-primary/25 hover:text-primary',
                                        drag
                                            ? 'cursor-grabbing'
                                            : 'cursor-grab',
                                    )}
                                >
                                    <GripVertical className="size-3.5" />
                                </button>

                                {/* Content (click to preview) */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        onSelectAppointment(item.appointment)
                                    }
                                    className="min-w-0 flex-1 px-2 py-1 text-left"
                                >
                                    <p className="font-medium text-foreground">
                                        {formatAppointmentTimeRange(
                                            item.appointment.start_at,
                                            item.appointment.end_at,
                                            timezone,
                                        )}
                                    </p>
                                    <p className="truncate text-foreground">
                                        {item.appointment.service.title}
                                    </p>
                                    <p className="truncate text-muted-foreground">
                                        {item.appointment.specialist.name}
                                    </p>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
