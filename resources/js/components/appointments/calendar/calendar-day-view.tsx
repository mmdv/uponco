import { useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from '@/hooks/use-translation';
import {
    dateKey,
    formatMinutes,
    GRID_END_MINUTES,
    GRID_HEIGHT,
    GRID_START_HOUR,
    GRID_START_MINUTES,
    HOUR_HEIGHT,
    minutesFromMidnight,
    SLOT_MINUTES,
    wallTimeToUtcIso,
} from '@/lib/calendar-grid';
import type { Appointment } from '@/types';

import DayColumn from './day-column';
import { buildPositionedColumns } from './day-view-layout';
import type {
    DayViewColumn,
    HoverState,
    PositionedColumn,
} from './day-view-types';
import { useDayViewDrag } from './use-day-view-drag';

export type { DayViewColumn } from './day-view-types';

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
    const [hover, setHover] = useState<HoverState | null>(null);

    const dayKey = dateKey(date);

    const { drag, drop, beginDrag, moveDrag, endDrag } = useDayViewDrag({
        dayKey,
        timezone,
        appointments,
        columnRefs,
        onReschedule,
    });

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

    const positionedColumns = useMemo(
        () => buildPositionedColumns(columns, appointments, dayKey, timezone),
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
        column: PositionedColumn,
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
            (item) => minutes >= item.startMinutes && minutes < item.endMinutes,
        );
    };

    const handleColumnClick = (
        event: React.MouseEvent,
        column: PositionedColumn,
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
        column: PositionedColumn,
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

    const registerRef = (id: number, element: HTMLDivElement | null) => {
        if (element) {
            columnRefs.current.set(id, element);
        } else {
            columnRefs.current.delete(id);
        }
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
                                {positionedColumns.map((entry) => (
                                    <DayColumn
                                        key={entry.column.specialist.id}
                                        entry={entry}
                                        columnWidth={columnWidth}
                                        pastCutoff={pastCutoff}
                                        clickable={Boolean(
                                            onCreateSlot && !isPastDay,
                                        )}
                                        drag={drag}
                                        drop={drop}
                                        hover={hover}
                                        timezone={timezone}
                                        registerRef={registerRef}
                                        onColumnClick={handleColumnClick}
                                        onColumnHover={handleColumnHover}
                                        onColumnLeave={() => setHover(null)}
                                        onBeginDrag={beginDrag}
                                        onMoveDrag={moveDrag}
                                        onEndDrag={endDrag}
                                        onSelectAppointment={
                                            onSelectAppointment
                                        }
                                    />
                                ))}

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
