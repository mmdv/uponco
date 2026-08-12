import {
    GRID_END_MINUTES,
    GRID_START_MINUTES,
    HOUR_HEIGHT,
    positionAppointments,
    timeToMinutes,
} from '@/lib/calendar-grid';
import type { Appointment } from '@/types';

import type { DayViewColumn, PositionedColumn } from './day-view-types';

/**
 * Lay each specialist's appointments and working windows out for the grid.
 *
 * Appointments are positioned within their own column so genuine double-bookings
 * still sit side by side. Windows are clamped to the grid and carry both their
 * pixel rect (for shading) and their minute bounds (for click-to-create hit
 * testing).
 */
export function buildPositionedColumns(
    columns: DayViewColumn[],
    appointments: Appointment[],
    dayKey: string,
    timezone: string,
): PositionedColumn[] {
    return columns.map((column) => ({
        column,
        items: positionAppointments(
            appointments.filter(
                (appointment) =>
                    appointment.specialist_id === column.specialist.id,
            ),
            dayKey,
            timezone,
        ),
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
                    top: ((start - GRID_START_MINUTES) / 60) * HOUR_HEIGHT,
                    height: ((end - start) / 60) * HOUR_HEIGHT,
                };
            })
            .filter((window) => window !== null),
        windowRanges: column.windows.map((window) => ({
            start: timeToMinutes(window.start),
            end: timeToMinutes(window.end),
        })),
    }));
}
