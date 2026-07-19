import type { Appointment } from '@/types';

/**
 * The wall-clock window the day/week time grids render. Appointments outside
 * this range are clamped so they remain visible at the grid edges.
 */
export const GRID_START_HOUR = 7;
export const GRID_END_HOUR = 22;
/** Pixel height of a single hour row in the day/week grids. */
export const HOUR_HEIGHT = 64;
/** Snap granularity (minutes) for drag-and-drop drop targets. */
export const SLOT_MINUTES = 15;

export const GRID_START_MINUTES = GRID_START_HOUR * 60;
export const GRID_END_MINUTES = GRID_END_HOUR * 60;
export const GRID_TOTAL_MINUTES = GRID_END_MINUTES - GRID_START_MINUTES;
export const GRID_HEIGHT = (GRID_TOTAL_MINUTES / 60) * HOUR_HEIGHT;

type ZonedParts = {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
};

/**
 * Break an ISO instant into its wall-clock parts within a timezone.
 */
function zonedParts(iso: string, timezone: string): ZonedParts {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });

    const parts: Record<string, string> = {};

    for (const part of formatter.formatToParts(new Date(iso))) {
        parts[part.type] = part.value;
    }

    return {
        year: Number(parts.year),
        month: Number(parts.month),
        day: Number(parts.day),
        // `24` is emitted for midnight by some engines; normalise to 0.
        hour: parts.hour === '24' ? 0 : Number(parts.hour),
        minute: Number(parts.minute),
    };
}

/**
 * Minutes since midnight for an instant, evaluated in the given timezone.
 */
export function minutesFromMidnight(iso: string, timezone: string): number {
    const { hour, minute } = zonedParts(iso, timezone);

    return hour * 60 + minute;
}

/**
 * The timezone offset (ms) `tzWallClock - utc` at the given instant.
 */
function timezoneOffset(date: Date, timezone: string): number {
    const { year, month, day, hour, minute } = zonedParts(
        date.toISOString(),
        timezone,
    );

    const asUtc = Date.UTC(year, month - 1, day, hour, minute);

    // Strip seconds/millis from the reference so only the offset remains.
    const truncated = Math.floor(date.getTime() / 60000) * 60000;

    return asUtc - truncated;
}

/**
 * Convert a wall-clock time (`YYYY-MM-DD` + minutes from midnight) in a
 * timezone into the matching ISO-8601 UTC instant.
 */
export function wallTimeToUtcIso(
    dayKey: string,
    minutes: number,
    timezone: string,
): string {
    const [year, month, day] = dayKey.split('-').map(Number);
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    const guess = Date.UTC(year, month - 1, day, hour, minute);
    const offset = timezoneOffset(new Date(guess), timezone);

    return new Date(guess - offset).toISOString();
}

/**
 * Format a minutes-from-midnight value as a `H:MM` / `HH:MM` label.
 */
export function formatMinutes(minutes: number): string {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    return `${hour}:${String(minute).padStart(2, '0')}`;
}

/**
 * The `YYYY-MM-DD` key for a local Date (used to bucket calendar cells).
 */
export function dateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Parse a `YYYY-MM-DD` key into a local Date at midnight.
 */
export function parseDateKey(key: string): Date {
    const [year, month, day] = key.split('-').map(Number);

    return new Date(year, month - 1, day);
}

/**
 * Add days to a date, returning a new Date.
 */
export function addDays(date: Date, amount: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);

    return next;
}

/**
 * Add months to a date, returning a new Date (clamped to month length).
 */
export function addMonths(date: Date, amount: number): Date {
    const next = new Date(date);
    next.setDate(1);
    next.setMonth(next.getMonth() + amount);

    return next;
}

/**
 * The seven dates (Mon–Sun) of the week containing the given date.
 */
export function weekDays(date: Date): Date[] {
    const start = new Date(date);
    // getDay(): 0 = Sun … 6 = Sat. Shift so Monday starts the week.
    const offset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - offset);

    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

/**
 * The calendar grid for a month: six whole weeks (Mon-start) covering the
 * month, so the grid height stays stable as the user pages through months.
 */
export function monthGridDays(date: Date): Date[] {
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    const start = weekDays(first)[0];

    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export type PositionedAppointment = {
    appointment: Appointment;
    /** Minutes from midnight of the start, clamped to the grid. */
    startMinutes: number;
    /** Minutes from midnight of the end, clamped to the grid. */
    endMinutes: number;
    top: number;
    height: number;
    /** Horizontal offset as a fraction (0–1) of the column area. */
    left: number;
    /** Width as a fraction (0–1) of the column area. */
    width: number;
};

/**
 * The `YYYY-MM-DD` day an appointment starts on, in its display timezone.
 */
export function appointmentDateKey(
    appointment: Appointment,
    timezone: string,
): string {
    const { year, month, day } = zonedParts(appointment.start_at, timezone);

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * The appointment's duration in minutes (from its start/end instants).
 */
export function appointmentDuration(appointment: Appointment): number {
    return Math.round(
        (new Date(appointment.end_at).getTime() -
            new Date(appointment.start_at).getTime()) /
            60000,
    );
}

/**
 * Position the appointments that fall on a given day within the time grid.
 */
export function positionAppointments(
    appointments: Appointment[],
    dayKey: string,
    timezone: string,
): PositionedAppointment[] {
    const blocks = appointments
        .filter(
            (appointment) =>
                appointmentDateKey(appointment, timezone) === dayKey,
        )
        .map((appointment) => {
            const rawStart = minutesFromMidnight(
                appointment.start_at,
                timezone,
            );
            const rawEnd = minutesFromMidnight(appointment.end_at, timezone);

            const startMinutes = Math.max(rawStart, GRID_START_MINUTES);
            // An end at/below the start means it crossed midnight; clamp to end.
            const endMinutes = Math.min(
                rawEnd <= rawStart ? GRID_END_MINUTES : rawEnd,
                GRID_END_MINUTES,
            );

            const top =
                ((startMinutes - GRID_START_MINUTES) / 60) * HOUR_HEIGHT;
            const height = Math.max(
                ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT,
                18,
            );

            return { appointment, startMinutes, endMinutes, top, height };
        })
        .sort(
            (a, b) =>
                a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes,
        );

    return layoutColumns(blocks);
}

type Block = Omit<PositionedAppointment, 'left' | 'width'>;

/**
 * Lay overlapping appointments out side by side. Blocks are grouped into
 * clusters of transitively overlapping items; within each cluster every block
 * is placed in the first free column, and all blocks share the cluster's column
 * count so their widths line up. Different customers booking different
 * specialists for the same slot therefore sit next to each other rather than
 * stacking on top of one another.
 */
function layoutColumns(blocks: Block[]): PositionedAppointment[] {
    const positioned: PositionedAppointment[] = [];
    let cluster: Block[] = [];
    let clusterEnd = -Infinity;

    const flush = () => {
        // Column ends: the latest `endMinutes` currently occupying each column.
        const columnEnds: number[] = [];
        const columnOf = new Map<Block, number>();

        for (const block of cluster) {
            let column = columnEnds.findIndex(
                (end) => end <= block.startMinutes,
            );

            if (column === -1) {
                column = columnEnds.length;
                columnEnds.push(block.endMinutes);
            } else {
                columnEnds[column] = block.endMinutes;
            }

            columnOf.set(block, column);
        }

        const count = columnEnds.length;

        for (const block of cluster) {
            const column = columnOf.get(block) ?? 0;

            positioned.push({
                ...block,
                left: column / count,
                width: 1 / count,
            });
        }
    };

    for (const block of blocks) {
        if (cluster.length > 0 && block.startMinutes >= clusterEnd) {
            flush();
            cluster = [];
            clusterEnd = -Infinity;
        }

        cluster.push(block);
        clusterEnd = Math.max(clusterEnd, block.endMinutes);
    }

    if (cluster.length > 0) {
        flush();
    }

    return positioned;
}

/**
 * Whether moving `appointment` to `[startMinutes, startMinutes + duration)` on
 * `dayKey` would overlap another appointment for the same specialist.
 *
 * This is the client-side guard that blocks dropping onto a booked slot; the
 * backend re-validates against work hours as the source of truth.
 */
export function wouldOverlap(
    appointment: Appointment,
    dayKey: string,
    startMinutes: number,
    appointments: Appointment[],
    timezone: string,
): boolean {
    const endMinutes = startMinutes + appointmentDuration(appointment);

    return appointments.some((other) => {
        if (other.id === appointment.id) {
            return false;
        }

        if (other.specialist_id !== appointment.specialist_id) {
            return false;
        }

        if (appointmentDateKey(other, timezone) !== dayKey) {
            return false;
        }

        const otherStart = minutesFromMidnight(other.start_at, timezone);
        const otherEnd = minutesFromMidnight(other.end_at, timezone);

        return startMinutes < otherEnd && endMinutes > otherStart;
    });
}
