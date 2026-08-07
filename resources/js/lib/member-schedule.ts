import { addDays, dateKey, monthGridDays, weekDays } from '@/lib/calendar-grid';
import type {
    DayScheduleMap,
    MemberScheduleView,
    ScheduleDayPayload,
    ScheduleSlot,
} from '@/types/schedule';

/** One-tap starting points in the day editor. */
export const SCHEDULE_PRESETS: ScheduleSlot[] = [
    { start: '09:00', end: '17:00' },
    { start: '10:00', end: '19:00' },
    { start: '08:00', end: '13:00' },
];

/** Block used when a day starts from scratch. */
export const DEFAULT_SLOT: ScheduleSlot = { start: '09:00', end: '17:00' };

/** Week counts offered by the "repeat this week" dialog. */
export const REPEAT_WEEK_OPTIONS = [1, 2, 4] as const;

/**
 * Selected-state classes for the schedule's toggle groups.
 *
 * The outline toggle's default "on" state is a faint muted fill that reads as
 * hover rather than selection, so the active option is filled with the primary
 * colour instead. Shared so the view tabs and the repeat-week options can't
 * drift apart.
 */
export const SELECTED_TOGGLE_CLASS =
    'data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary data-[state=on]:hover:text-primary-foreground';

/**
 * The dates covered by a view: seven Mon–Sun days for `week`, the full six-week
 * calendar grid for `month`. Both come from the shared calendar helpers so the
 * per-member views and the appointments calendar agree on where a week starts.
 */
export function viewDays(view: MemberScheduleView, anchor: Date): Date[] {
    return view === 'week' ? weekDays(anchor) : monthGridDays(anchor);
}

/**
 * The `from`/`to` query range for a view, as `YYYY-MM-DD`.
 */
export function viewRange(
    view: MemberScheduleView,
    anchor: Date,
): { from: string; to: string } {
    const days = viewDays(view, anchor);

    return { from: dateKey(days[0]), to: dateKey(days[days.length - 1]) };
}

/**
 * Move the anchor one view forward or back — a week for `week`, a month for
 * `month`.
 *
 * Months are stepped from the first of the month so paging past a short month
 * (31 Mar → Feb) cannot skip one.
 */
export function shiftAnchor(
    view: MemberScheduleView,
    anchor: Date,
    direction: -1 | 1,
): Date {
    if (view === 'week') {
        return addDays(anchor, direction * 7);
    }

    return new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1);
}

/**
 * Minutes between two `HH:MM` times.
 */
export function slotMinutes(slot: ScheduleSlot): number {
    const [startHour, startMinute] = slot.start.split(':').map(Number);
    const [endHour, endMinute] = slot.end.split(':').map(Number);

    // A block being typed starts out blank, which parses to undefined/NaN —
    // guard so an in-progress edit can't poison the hours total.
    if (![startHour, startMinute, endHour, endMinute].every(Number.isFinite)) {
        return 0;
    }

    return Math.max(
        0,
        endHour * 60 + endMinute - (startHour * 60 + startMinute),
    );
}

/**
 * Total scheduled minutes across a list of blocks.
 */
export function totalSlotMinutes(slots: ScheduleSlot[]): number {
    return slots.reduce((total, slot) => total + slotMinutes(slot), 0);
}

/**
 * Total scheduled minutes across the given days of a slot map.
 */
export function totalMinutesForDays(
    slots: DayScheduleMap,
    days: Date[],
): number {
    return days.reduce(
        (total, day) => total + totalSlotMinutes(slots[dateKey(day)] ?? []),
        0,
    );
}

/**
 * A compact hours label, e.g. `0h`, `6h`, `7h 30m`.
 */
export function formatHours(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;

    return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
}

/**
 * Whether a date is strictly before today (past days are read-only, matching
 * the team grid).
 */
export function isPastDay(day: Date, today: Date = new Date()): boolean {
    return dateKey(day) < dateKey(today);
}

/**
 * The payload that copies a week's pattern onto the following `weeks` weeks.
 *
 * Every day is emitted, including days with no blocks — copying a week means
 * its days off travel with it. Past dates are skipped so a repeat that reaches
 * backwards cannot rewrite history.
 */
export function repeatWeekPayload(
    weekDates: Date[],
    slots: DayScheduleMap,
    weeks: number,
    today: Date = new Date(),
): ScheduleDayPayload[] {
    const payload: ScheduleDayPayload[] = [];

    for (let week = 1; week <= weeks; week++) {
        for (const source of weekDates) {
            const target = addDays(source, week * 7);

            if (isPastDay(target, today)) {
                continue;
            }

            payload.push({
                date: dateKey(target),
                slots: (slots[dateKey(source)] ?? []).map((slot) => ({
                    ...slot,
                })),
            });
        }
    }

    return payload;
}

/**
 * The blocks to seed the day editor with for a set of selected days.
 *
 * When every selected day already shares the exact same blocks that schedule is
 * pre-filled, so nudging a repeated pattern is effortless; mixed or empty
 * selections start from a single default block. Mirrors the team grid's drawer.
 */
export function initialSlotsForDays(
    dayKeys: string[],
    slots: DayScheduleMap,
): ScheduleSlot[] {
    const perDay = dayKeys.map((key) => slots[key] ?? []);
    const scheduled = perDay.filter((daySlots) => daySlots.length > 0);

    if (scheduled.length === 0 || scheduled.length !== perDay.length) {
        return [{ ...DEFAULT_SLOT }];
    }

    const first = JSON.stringify(scheduled[0]);

    return scheduled.every((daySlots) => JSON.stringify(daySlots) === first)
        ? scheduled[0].map((slot) => ({ ...slot }))
        : [{ ...DEFAULT_SLOT }];
}
