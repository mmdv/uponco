import type { TeamRole } from './teams';

/**
 * A team member shown as a row in the scheduling grid. Mocked on the front-end
 * for now; will be replaced by real team data once persistence is wired up.
 */
export type ScheduleMember = {
    id: number;
    name: string;
    avatar?: string | null;
    role: TeamRole;
};

/**
 * A selectable month in the bottom carousel.
 */
export type MonthTab = {
    /** `YYYY-MM` — stable identity for the active-month state. */
    key: string;
    /** Short month label, e.g. `Jul` (year shown separately in the tab). */
    monthLabel: string;
    year: number;
    /** Zero-based month index (0 = January). */
    month: number;
    /** Whether this is the reference ("current") month. */
    isCurrent: boolean;
};

/**
 * A single day column of the active month's grid.
 */
export type DayColumn = {
    /** `YYYY-MM-DD` — matches `dateKey()` from `lib/calendar-grid`. */
    key: string;
    date: Date;
    /** Day of the month, e.g. `10`. */
    dayNumber: string;
    /** Short weekday, e.g. `Fri`. */
    weekday: string;
    isToday: boolean;
};

/**
 * Identifier for a selected grid cell: `${memberId}:${dateKey}`.
 */
export type CellId = string;

/**
 * A single working time block for a member on a given day.
 */
export type ScheduleSlot = { start: string; end: string };

/**
 * Persisted slots keyed by {@link CellId} (`${memberId}:${dateKey}`).
 */
export type ScheduleSlotMap = Record<CellId, ScheduleSlot[]>;
