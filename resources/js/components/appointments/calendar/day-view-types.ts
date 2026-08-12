import type { PositionedAppointment } from '@/lib/calendar-grid';
import type { Appointment, WorkingWindow } from '@/types';

/** A single specialist column: who it is and the hours they work that day. */
export type DayViewColumn = {
    specialist: { id: number; name: string; avatar?: string | null };
    windows: WorkingWindow[];
};

/** A working window resolved to both pixel rect and minute bounds. */
export type PositionedWindow = {
    start: number;
    end: number;
    top: number;
    height: number;
};

/** A specialist column with its appointments and windows laid out for the grid. */
export type PositionedColumn = {
    column: DayViewColumn;
    items: PositionedAppointment[];
    windows: PositionedWindow[];
    windowRanges: { start: number; end: number }[];
};

export type DragState = {
    appointment: Appointment;
    duration: number;
    /** The column element the drag is anchored to (drags stay within it). */
    columnEl: HTMLDivElement;
    /** Pixels between the pointer and the top of the block when grabbed. */
    grabOffset: number;
};

export type DropState = {
    minutes: number;
    valid: boolean;
};

export type HoverState = {
    specialistId: number;
    minutes: number;
};
