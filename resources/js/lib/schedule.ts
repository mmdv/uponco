import { addMonths, dateKey } from '@/lib/calendar-grid';
import type { CellId, DayColumn, MonthTab } from '@/types/schedule';

/** Months shown before the reference month in the bottom carousel. */
const MONTHS_BEFORE = 6;
/** Total months in the carousel (6 before + current + 17 after). */
const TOTAL_MONTHS = 24;

const monthLabelFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
});

const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
});

/**
 * The `YYYY-MM` key for a year/month pair.
 */
export function monthKey(year: number, month: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
}

/**
 * Build the 24 month tabs for the bottom carousel: six months before the
 * reference month through seventeen after, so the current month sits near the
 * start while the user can still page back and well into the future.
 */
export function buildMonthTabs(reference: Date = new Date()): MonthTab[] {
    const currentKey = monthKey(reference.getFullYear(), reference.getMonth());

    return Array.from({ length: TOTAL_MONTHS }, (_, index) => {
        const date = addMonths(reference, index - MONTHS_BEFORE);
        const year = date.getFullYear();
        const month = date.getMonth();
        const key = monthKey(year, month);

        return {
            key,
            monthLabel: monthLabelFormatter.format(date),
            year,
            month,
            isCurrent: key === currentKey,
        };
    });
}

/**
 * Every day of the given month as an ordered list of grid columns.
 */
export function monthDayColumns(
    year: number,
    month: number,
    today: Date = new Date(),
): DayColumn[] {
    const todayKey = dateKey(today);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, index) => {
        const date = new Date(year, month, index + 1);
        const key = dateKey(date);

        return {
            key,
            date,
            dayNumber: String(index + 1),
            weekday: weekdayFormatter.format(date),
            isToday: key === todayKey,
        };
    });
}

/**
 * The index of today's column, or 0 when today is not in the given month. Used
 * to anchor the horizontal scroll so the current day is leftmost by default.
 */
export function todayColumnIndex(columns: DayColumn[]): number {
    const index = columns.findIndex((column) => column.isToday);

    return index === -1 ? 0 : index;
}

/**
 * The composite id for a member/day cell.
 */
export function cellId(memberId: number, dayKey: string): CellId {
    return `${memberId}:${dayKey}`;
}

/**
 * The `YYYY-MM-DD` day part of a cell id.
 */
export function cellDayKey(id: CellId): string {
    return id.slice(id.indexOf(':') + 1);
}

/**
 * The numeric member id part of a cell id.
 */
export function cellMemberId(id: CellId): number {
    return Number(id.slice(0, id.indexOf(':')));
}
