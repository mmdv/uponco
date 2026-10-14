import { useEffect, useRef, useState } from 'react';

import {
    appointmentDuration,
    GRID_END_MINUTES,
    GRID_START_MINUTES,
    HOUR_HEIGHT,
    SLOT_MINUTES,
    wallTimeToUtcIso,
    wouldOverlap,
} from '@/lib/calendar-grid';
import type { Appointment } from '@/types';

import type { DragState, DropState } from './day-view-types';

/** How long the handle must be held before a drag starts. */
export const LONG_PRESS_MS = 1000;

/** Pointer travel (px) allowed while holding before the press is abandoned. */
const LONG_PRESS_TOLERANCE_PX = 8;

/** Current epoch ms. Wrapped so the impure read stays out of render scope. */
function nowMs(): number {
    return Date.now();
}

type Params = {
    dayKey: string;
    timezone: string;
    appointments: Appointment[];
    columnRefs: React.RefObject<Map<number, HTMLDivElement>>;
    onReschedule: (appointment: Appointment, startIso: string) => void;
};

type DayViewDrag = {
    drag: DragState | null;
    drop: DropState | null;
    /** Id of the appointment whose handle is being held, before the drag starts. */
    pressingId: number | null;
    beginDrag: (
        event: React.PointerEvent,
        item: { appointment: Appointment; top: number },
    ) => void;
    moveDrag: (event: React.PointerEvent) => void;
    endDrag: (event: React.PointerEvent) => void;
};

/**
 * Drag-to-reschedule for the day grid: tracks the block being dragged and the
 * snapped, validated drop target under the pointer. A drop only commits when it
 * lands inside the grid, in the future, and clear of other bookings.
 *
 * The drag only starts after the handle is held still for LONG_PRESS_MS, so a
 * quick tap or brush can't move a booking by accident.
 */
export function useDayViewDrag({
    dayKey,
    timezone,
    appointments,
    columnRefs,
    onReschedule,
}: Params): DayViewDrag {
    const [drag, setDrag] = useState<DragState | null>(null);
    const [drop, setDrop] = useState<DropState | null>(null);
    const [pressingId, setPressingId] = useState<number | null>(null);
    const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pressOrigin = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const lastPointerY = useRef(0);

    const cancelPress = () => {
        if (pressTimer.current !== null) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }

        setPressingId(null);
    };

    useEffect(
        () => () => {
            if (pressTimer.current !== null) {
                clearTimeout(pressTimer.current);
            }
        },
        [],
    );

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

        // An appointment whose specialist was deleted has no column to drag in.
        if (item.appointment.specialist_id === null) {
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

        pressOrigin.current = { x: event.clientX, y: event.clientY };
        lastPointerY.current = event.clientY;
        setPressingId(item.appointment.id);

        pressTimer.current = setTimeout(() => {
            pressTimer.current = null;
            setPressingId(null);
            navigator.vibrate?.(15);

            setDrag(state);
            setDrop(
                evaluateDrop(
                    minutesForPointer(lastPointerY.current, state),
                    state,
                    nowMs(),
                ),
            );
        }, LONG_PRESS_MS);
    };

    const moveDrag = (event: React.PointerEvent) => {
        lastPointerY.current = event.clientY;

        if (pressTimer.current !== null) {
            const travelled = Math.hypot(
                event.clientX - pressOrigin.current.x,
                event.clientY - pressOrigin.current.y,
            );

            if (travelled > LONG_PRESS_TOLERANCE_PX) {
                cancelPress();
            }

            return;
        }

        if (!drag) {
            return;
        }

        setDrop(
            evaluateDrop(minutesForPointer(event.clientY, drag), drag, nowMs()),
        );
    };

    const endDrag = (event: React.PointerEvent) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        // Released (or moved off) before the hold completed: not a drag.
        if (pressTimer.current !== null) {
            cancelPress();

            return;
        }

        if (!drag) {
            return;
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

    return { drag, drop, pressingId, beginDrag, moveDrag, endDrag };
}
