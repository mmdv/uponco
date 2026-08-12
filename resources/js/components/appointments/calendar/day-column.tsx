import { GripVertical, Plus } from 'lucide-react';

import { useTranslation } from '@/hooks/use-translation';
import { formatAppointmentTimeRange } from '@/lib/appointments';
import {
    formatMinutes,
    GRID_END_MINUTES,
    GRID_START_HOUR,
    GRID_START_MINUTES,
    HOUR_HEIGHT,
    SLOT_MINUTES,
} from '@/lib/calendar-grid';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types';

import type {
    DragState,
    DropState,
    HoverState,
    PositionedColumn,
} from './day-view-types';

/** The grid hours, drawn per column so the lines align across all of them. */
const HOURS = Array.from(
    { length: GRID_END_MINUTES / 60 - GRID_START_HOUR + 1 },
    (_, index) => GRID_START_HOUR + index,
);

/**
 * Diagonal hatching for non-working (non-selectable) time, a touch darker than a
 * flat fill. Theme-aware via `--muted-foreground`, so it reads on light and dark.
 */
const NON_WORKING_STRIPES: React.CSSProperties = {
    backgroundImage:
        'repeating-linear-gradient(45deg, color-mix(in oklab, var(--muted-foreground) 16%, transparent) 0, color-mix(in oklab, var(--muted-foreground) 16%, transparent) 5px, transparent 5px, transparent 11px)',
};

type Props = {
    entry: PositionedColumn;
    columnWidth: number;
    pastCutoff: number | null;
    clickable: boolean;
    drag: DragState | null;
    drop: DropState | null;
    hover: HoverState | null;
    timezone: string;
    registerRef: (id: number, element: HTMLDivElement | null) => void;
    onColumnClick: (event: React.MouseEvent, entry: PositionedColumn) => void;
    onColumnHover: (event: React.MouseEvent, entry: PositionedColumn) => void;
    onColumnLeave: () => void;
    onBeginDrag: (
        event: React.PointerEvent,
        item: { appointment: Appointment; top: number },
    ) => void;
    onMoveDrag: (event: React.PointerEvent) => void;
    onEndDrag: (event: React.PointerEvent) => void;
    onSelectAppointment: (appointment: Appointment) => void;
};

/** One specialist's column: working windows, hour lines, drop/hover cues, blocks. */
export default function DayColumn({
    entry,
    columnWidth,
    pastCutoff,
    clickable,
    drag,
    drop,
    hover,
    timezone,
    registerRef,
    onColumnClick,
    onColumnHover,
    onColumnLeave,
    onBeginDrag,
    onMoveDrag,
    onEndDrag,
    onSelectAppointment,
}: Props) {
    const { t } = useTranslation('appointments');
    const { column, items, windows } = entry;
    const showDrop = drag?.appointment.specialist_id === column.specialist.id;
    const showHover = hover?.specialistId === column.specialist.id;

    return (
        <div
            data-test="calendar-day-column"
            ref={(element) => registerRef(column.specialist.id, element)}
            style={{ width: columnWidth, ...NON_WORKING_STRIPES }}
            className={cn(
                'relative shrink-0 border-r bg-background last:border-r-0',
                clickable && 'cursor-pointer',
            )}
            onClick={(event) => onColumnClick(event, entry)}
            onMouseMove={(event) => onColumnHover(event, entry)}
            onMouseLeave={onColumnLeave}
        >
            {/* Working windows: a white, dashed-green-bordered area over the
                hatched base. On today (and past days) the elapsed part is grey. */}
            {windows.map((window, index) => {
                const grey = pastCutoff !== null && pastCutoff > window.start;

                return (
                    <div
                        key={index}
                        className="absolute inset-x-0 overflow-hidden rounded-sm border border-dashed border-emerald-500/50 bg-background"
                        style={{ top: window.top, height: window.height }}
                    >
                        {grey && (
                            <div
                                className="absolute inset-x-0 top-0 bg-muted/70"
                                style={{
                                    height:
                                        ((Math.min(pastCutoff, window.end) -
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
                    style={{ top: index * HOUR_HEIGHT }}
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
                            ((drop.minutes - GRID_START_MINUTES) / 60) *
                            HOUR_HEIGHT,
                        height: (drag.duration / 60) * HOUR_HEIGHT,
                    }}
                >
                    <span className="px-2 text-xs font-medium">
                        {formatMinutes(drop.minutes)}
                        {!drop.valid && ` · ${t('dayView.unavailable')}`}
                    </span>
                </div>
            )}

            {/* Hover affordance: the 15-min band a click would book */}
            {showHover && hover && (
                <div
                    className="pointer-events-none absolute inset-x-1 z-[5] flex items-center justify-center rounded-md border border-dashed border-primary/50 bg-primary/5 text-primary/70"
                    style={{
                        top:
                            ((hover.minutes - GRID_START_MINUTES) / 60) *
                            HOUR_HEIGHT,
                        height: (SLOT_MINUTES / 60) * HOUR_HEIGHT,
                    }}
                >
                    <Plus className="size-3.5" />
                </div>
            )}

            {/* Appointments */}
            {items.map((item) => {
                const isDragged = drag?.appointment.id === item.appointment.id;

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
                            onPointerDown={(event) => onBeginDrag(event, item)}
                            onPointerMove={onMoveDrag}
                            onPointerUp={onEndDrag}
                            onPointerCancel={onEndDrag}
                            className={cn(
                                'flex w-5 shrink-0 touch-none items-center justify-center border-r border-primary/20 bg-primary/15 text-primary/70 hover:bg-primary/25 hover:text-primary',
                                drag ? 'cursor-grabbing' : 'cursor-grab',
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
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
