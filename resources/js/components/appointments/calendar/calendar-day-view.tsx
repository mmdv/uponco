import { GripVertical, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from '@/hooks/use-translation';
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
    timeToMinutes,
    wallTimeToUtcIso,
    wouldOverlap,
} from '@/lib/calendar-grid';
import { cn } from '@/lib/utils';
import type { Appointment, WorkingWindow } from '@/types';

const HOURS = Array.from(
    { length: GRID_END_MINUTES / 60 - GRID_START_HOUR + 1 },
    (_, index) => GRID_START_HOUR + index,
);

/** Width (px) of the fixed hour-label gutter — matches `w-16`. */
const GUTTER_WIDTH = 64;
/** Floor for a single column so it never collapses on very narrow screens. */
const MIN_COLUMN_WIDTH = 96;
/** Below this container width we cap the day view at 3 columns, else 5. */
const MOBILE_BREAKPOINT = 768;
const MOBILE_MAX_COLUMNS = 3;
const DESKTOP_MAX_COLUMNS = 5;

/**
 * Diagonal hatching for non-working (non-selectable) time, a touch darker than a
 * flat fill. Theme-aware via `--muted-foreground`, so it reads on light and dark.
 */
const NON_WORKING_STRIPES: React.CSSProperties = {
    backgroundImage:
        'repeating-linear-gradient(45deg, color-mix(in oklab, var(--muted-foreground) 16%, transparent) 0, color-mix(in oklab, var(--muted-foreground) 16%, transparent) 5px, transparent 5px, transparent 11px)',
};

/** A single specialist column: who it is and the hours they work that day. */
export type DayViewColumn = {
    specialist: { id: number; name: string; avatar?: string | null };
    windows: WorkingWindow[];
};

/** Current epoch ms. Wrapped so the impure read stays out of render scope. */
function nowMs(): number {
    return Date.now();
}

type DragState = {
    appointment: Appointment;
    duration: number;
    /** The column element the drag is anchored to (drags stay within it). */
    columnEl: HTMLDivElement;
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
    columns: DayViewColumn[];
    workingHoursLoading: boolean;
    timezone: string;
    onSelectAppointment: (appointment: Appointment) => void;
    onReschedule: (appointment: Appointment, startIso: string) => void;
    onCreateSlot?: (specialistId: number, startIso: string) => void;
};

type HoverState = {
    specialistId: number;
    minutes: number;
};

export default function CalendarDayView({
    date,
    appointments,
    columns,
    workingHoursLoading,
    timezone,
    onSelectAppointment,
    onReschedule,
    onCreateSlot,
}: Props) {
    const { t } = useTranslation('appointments');
    const scrollRef = useRef<HTMLDivElement>(null);
    const columnRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const [containerWidth, setContainerWidth] = useState(0);
    const [drag, setDrag] = useState<DragState | null>(null);
    const [drop, setDrop] = useState<DropState | null>(null);
    const [hover, setHover] = useState<HoverState | null>(null);

    const dayKey = dateKey(date);

    // Track the scroll container's width so the columns can be sized to fill it
    // (up to the per-breakpoint cap) with any extras overflowing to scroll.
    useEffect(() => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        setContainerWidth(element.clientWidth);

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    const count = columns.length;

    const columnWidth = useMemo(() => {
        if (count === 0 || containerWidth === 0) {
            return MIN_COLUMN_WIDTH;
        }

        const visible =
            containerWidth < MOBILE_BREAKPOINT
                ? MOBILE_MAX_COLUMNS
                : DESKTOP_MAX_COLUMNS;

        return Math.max(
            (containerWidth - GUTTER_WIDTH) / Math.min(count, visible),
            MIN_COLUMN_WIDTH,
        );
    }, [count, containerWidth]);

    // Position each specialist's appointments within their own column, so genuine
    // double-bookings still sit side by side inside the column.
    const positionedColumns = useMemo(
        () =>
            columns.map((column) => ({
                column,
                items: positionAppointments(
                    appointments.filter(
                        (appointment) =>
                            appointment.specialist_id === column.specialist.id,
                    ),
                    dayKey,
                    timezone,
                ),
                // Working windows clamped to the grid, carrying both their pixel
                // rect and their minute bounds (for shading and hit testing).
                windows: column.windows
                    .map((window) => {
                        const start = Math.max(
                            timeToMinutes(window.start),
                            GRID_START_MINUTES,
                        );
                        const end = Math.min(
                            timeToMinutes(window.end),
                            GRID_END_MINUTES,
                        );

                        if (end <= start) {
                            return null;
                        }

                        return {
                            start,
                            end,
                            top:
                                ((start - GRID_START_MINUTES) / 60) *
                                HOUR_HEIGHT,
                            height: ((end - start) / 60) * HOUR_HEIGHT,
                        };
                    })
                    .filter(
                        (
                            window,
                        ): window is {
                            start: number;
                            end: number;
                            top: number;
                            height: number;
                        } => window !== null,
                    ),
                // Working windows as minute ranges, for click-to-create hit testing.
                windowRanges: column.windows.map((window) => ({
                    start: timeToMinutes(window.start),
                    end: timeToMinutes(window.end),
                })),
            })),
        [columns, appointments, dayKey, timezone],
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
        const rect = state.columnEl.getBoundingClientRect();

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

        const columnEl = columnRefs.current.get(item.appointment.specialist_id);

        if (!columnEl) {
            return;
        }

        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);

        const rect = columnEl.getBoundingClientRect();
        const grabOffset = event.clientY - rect.top - item.top;

        const state: DragState = {
            appointment: item.appointment,
            duration: appointmentDuration(item.appointment),
            columnEl,
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

    const todayKey = useMemo(() => dateKey(new Date()), []);
    const isPastDay = dayKey < todayKey;

    // The minute up to which working time counts as "passed" and is shaded grey:
    // the whole day for past days, up to now for today, and nothing for future days.
    const pastCutoff = useMemo(() => {
        if (dayKey < todayKey) {
            return GRID_END_MINUTES;
        }

        if (dayKey > todayKey) {
            return null;
        }

        const minutes = minutesFromMidnight(new Date().toISOString(), timezone);

        return Math.min(
            Math.max(minutes, GRID_START_MINUTES),
            GRID_END_MINUTES,
        );
    }, [dayKey, todayKey, timezone]);

    /** Snap a pointer position within a column down to its 15-minute band. */
    const minutesForColumnPointer = (
        clientY: number,
        columnEl: HTMLElement,
    ): number => {
        const rect = columnEl.getBoundingClientRect();
        const raw =
            GRID_START_MINUTES + ((clientY - rect.top) / HOUR_HEIGHT) * 60;
        const snapped = Math.floor(raw / SLOT_MINUTES) * SLOT_MINUTES;

        return Math.min(
            Math.max(snapped, GRID_START_MINUTES),
            GRID_END_MINUTES - SLOT_MINUTES,
        );
    };

    /**
     * Whether a new appointment may start at `minutes` in this column: inside a
     * working window, not in the past, and not landing on an existing booking.
     */
    const creatableMinute = (
        minutes: number,
        column: (typeof positionedColumns)[number],
    ): boolean => {
        if (nowMinutes !== null && minutes < nowMinutes) {
            return false;
        }

        const inWindow = column.windowRanges.some(
            (range) => minutes >= range.start && minutes < range.end,
        );

        if (!inWindow) {
            return false;
        }

        return !column.items.some(
            (item) =>
                minutes >= item.startMinutes && minutes < item.endMinutes,
        );
    };

    const handleColumnClick = (
        event: React.MouseEvent,
        column: (typeof positionedColumns)[number],
    ) => {
        if (!onCreateSlot || drag || isPastDay) {
            return;
        }

        const columnEl = columnRefs.current.get(column.column.specialist.id);

        if (!columnEl) {
            return;
        }

        const minutes = minutesForColumnPointer(event.clientY, columnEl);

        if (!creatableMinute(minutes, column)) {
            return;
        }

        onCreateSlot(
            column.column.specialist.id,
            wallTimeToUtcIso(dayKey, minutes, timezone),
        );
    };

    const handleColumnHover = (
        event: React.MouseEvent,
        column: (typeof positionedColumns)[number],
    ) => {
        const columnEl = columnRefs.current.get(column.column.specialist.id);

        if (!onCreateSlot || !columnEl || drag || isPastDay) {
            setHover(null);

            return;
        }

        const minutes = minutesForColumnPointer(event.clientY, columnEl);

        setHover(
            creatableMinute(minutes, column)
                ? { specialistId: column.column.specialist.id, minutes }
                : null,
        );
    };

    const contentWidth = GUTTER_WIDTH + columnWidth * count;

    return (
        <div className="overflow-hidden rounded-lg border select-none">
            <div ref={scrollRef} className="max-h-[70vh] overflow-auto">
                {count === 0 ? (
                    <div className="p-10 text-center text-sm text-muted-foreground">
                        {workingHoursLoading
                            ? t('dayView.loading')
                            : t('dayView.empty')}
                    </div>
                ) : (
                    <div style={{ width: contentWidth }}>
                        {/* Header row — specialist names, pinned to the top */}
                        <div className="sticky top-0 z-30 flex bg-background">
                            <div className="sticky left-0 z-40 h-11 w-16 shrink-0 border-r border-b bg-background" />
                            {columns.map((column) => (
                                <div
                                    key={column.specialist.id}
                                    style={{ width: columnWidth }}
                                    className="flex h-11 shrink-0 items-center justify-center border-r border-b px-2 last:border-r-0"
                                >
                                    <span
                                        className="truncate text-sm font-medium"
                                        title={column.specialist.name}
                                    >
                                        {column.specialist.name}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Body — hour gutter + one time column per specialist */}
                        <div className="flex">
                            {/* Hour gutter, pinned to the left */}
                            <div className="sticky left-0 z-20 w-16 shrink-0 border-r bg-background">
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
                                            {index === 0
                                                ? ''
                                                : formatMinutes(hour * 60)}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Columns wrapper */}
                            <div
                                className="relative flex"
                                style={{ height: GRID_HEIGHT }}
                            >
                                {positionedColumns.map((entry) => {
                                    const { column, items, windows } = entry;
                                    const showDrop =
                                        drag?.appointment.specialist_id ===
                                        column.specialist.id;
                                    const showHover =
                                        hover?.specialistId ===
                                        column.specialist.id;

                                    return (
                                        <div
                                            key={column.specialist.id}
                                            data-test="calendar-day-column"
                                            ref={(element) => {
                                                if (element) {
                                                    columnRefs.current.set(
                                                        column.specialist.id,
                                                        element,
                                                    );
                                                } else {
                                                    columnRefs.current.delete(
                                                        column.specialist.id,
                                                    );
                                                }
                                            }}
                                            style={{
                                                width: columnWidth,
                                                ...NON_WORKING_STRIPES,
                                            }}
                                            className={cn(
                                                'relative shrink-0 border-r bg-background last:border-r-0',
                                                onCreateSlot &&
                                                    !isPastDay &&
                                                    'cursor-pointer',
                                            )}
                                            onClick={(event) =>
                                                handleColumnClick(event, entry)
                                            }
                                            onMouseMove={(event) =>
                                                handleColumnHover(event, entry)
                                            }
                                            onMouseLeave={() => setHover(null)}
                                        >
                                            {/* Working windows: a white, dashed-green-bordered
                                                area over the hatched base. On today (and past
                                                days) the elapsed part is shaded grey. */}
                                            {windows.map((window, index) => {
                                                const grey =
                                                    pastCutoff !== null &&
                                                    pastCutoff > window.start;

                                                return (
                                                    <div
                                                        key={index}
                                                        className="absolute inset-x-0 overflow-hidden rounded-sm border border-dashed border-emerald-500/50 bg-background"
                                                        style={{
                                                            top: window.top,
                                                            height: window.height,
                                                        }}
                                                    >
                                                        {grey && (
                                                            <div
                                                                className="absolute inset-x-0 top-0 bg-muted/70"
                                                                style={{
                                                                    height:
                                                                        ((Math.min(
                                                                            pastCutoff,
                                                                            window.end,
                                                                        ) -
                                                                            window.start) /
                                                                            60) *
                                                                        HOUR_HEIGHT,
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}

                                                {/* Hour lines, drawn per column so they align across all */}
                                                {HOURS.map((hour, index) => (
                                                    <div
                                                        key={hour}
                                                        className="absolute inset-x-0 border-t border-border/60"
                                                        style={{
                                                            top:
                                                                index *
                                                                HOUR_HEIGHT,
                                                        }}
                                                    />
                                                ))}

                                                {/* Drop indicator for a drag inside this column */}
                                                {showDrop && drag && drop && (
                                                    <div
                                                        className={cn(
                                                            'pointer-events-none absolute inset-x-1 z-30 rounded-md border-2 border-dashed',
                                                            drop.valid
                                                                ? 'border-emerald-500 bg-emerald-500/10'
                                                                : 'border-red-500 bg-red-500/10',
                                                        )}
                                                        style={{
                                                            top:
                                                                ((drop.minutes -
                                                                    GRID_START_MINUTES) /
                                                                    60) *
                                                                HOUR_HEIGHT,
                                                            height:
                                                                (drag.duration /
                                                                    60) *
                                                                HOUR_HEIGHT,
                                                        }}
                                                    >
                                                        <span className="px-2 text-xs font-medium">
                                                            {formatMinutes(
                                                                drop.minutes,
                                                            )}
                                                            {!drop.valid &&
                                                                ` · ${t('dayView.unavailable')}`}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Hover affordance: the 15-min band a click would book */}
                                                {showHover && hover && (
                                                    <div
                                                        className="pointer-events-none absolute inset-x-1 z-[5] flex items-center justify-center rounded-md border border-dashed border-primary/50 bg-primary/5 text-primary/70"
                                                        style={{
                                                            top:
                                                                ((hover.minutes -
                                                                    GRID_START_MINUTES) /
                                                                    60) *
                                                                HOUR_HEIGHT,
                                                            height:
                                                                (SLOT_MINUTES /
                                                                    60) *
                                                                HOUR_HEIGHT,
                                                        }}
                                                    >
                                                        <Plus className="size-3.5" />
                                                    </div>
                                                )}

                                                {/* Appointments */}
                                                {items.map((item) => {
                                                    const isDragged =
                                                        drag?.appointment.id ===
                                                        item.appointment.id;

                                                    return (
                                                        <div
                                                            key={
                                                                item.appointment
                                                                    .id
                                                            }
                                                            data-test="calendar-appointment"
                                                            className={cn(
                                                                'absolute z-10 flex overflow-hidden rounded-md border border-primary/30 bg-primary/10 text-xs shadow-sm transition-shadow',
                                                                isDragged &&
                                                                    'opacity-40',
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
                                                                onPointerDown={(
                                                                    event,
                                                                ) =>
                                                                    beginDrag(
                                                                        event,
                                                                        item,
                                                                    )
                                                                }
                                                                onPointerMove={
                                                                    moveDrag
                                                                }
                                                                onPointerUp={
                                                                    endDrag
                                                                }
                                                                onPointerCancel={
                                                                    endDrag
                                                                }
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
                                                                    onSelectAppointment(
                                                                        item.appointment,
                                                                    )
                                                                }
                                                                className="min-w-0 flex-1 px-2 py-1 text-left"
                                                            >
                                                                <p className="font-medium text-foreground">
                                                                    {formatAppointmentTimeRange(
                                                                        item
                                                                            .appointment
                                                                            .start_at,
                                                                        item
                                                                            .appointment
                                                                            .end_at,
                                                                        timezone,
                                                                    )}
                                                                </p>
                                                                <p className="truncate text-foreground">
                                                                    {
                                                                        item
                                                                            .appointment
                                                                            .service
                                                                            .title
                                                                    }
                                                                </p>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    },
                                )}

                                {/* Current-time indicator, spanning every column */}
                                {nowMinutes !== null && (
                                    <div
                                        className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
                                        style={{
                                            top:
                                                ((nowMinutes -
                                                    GRID_START_MINUTES) /
                                                    60) *
                                                HOUR_HEIGHT,
                                        }}
                                    >
                                        <div className="size-2 -translate-x-1/2 rounded-full bg-red-500" />
                                        <div className="h-px flex-1 bg-red-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
