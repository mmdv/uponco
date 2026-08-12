import { useState } from 'react';

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

    return { drag, drop, beginDrag, moveDrag, endDrag };
}
