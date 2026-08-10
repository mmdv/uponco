import { describe, expect, it } from 'vitest';

import {
    GRID_END_MINUTES,
    GRID_HEIGHT,
    GRID_START_MINUTES,
    HOUR_HEIGHT,
    timeToMinutes,
    windowRect,
} from '@/lib/calendar-grid';

describe('timeToMinutes', () => {
    it('converts a wall-clock HH:MM into minutes from midnight', () => {
        expect(timeToMinutes('00:00')).toBe(0);
        expect(timeToMinutes('09:30')).toBe(570);
        expect(timeToMinutes('22:00')).toBe(1320);
    });
});

describe('windowRect', () => {
    it('positions a window that sits inside the grid', () => {
        const rect = windowRect(GRID_START_MINUTES + 60, GRID_START_MINUTES + 180);

        expect(rect).toEqual({ top: HOUR_HEIGHT, height: 2 * HOUR_HEIGHT });
    });

    it('clamps a window that overflows the grid edges', () => {
        const rect = windowRect(GRID_START_MINUTES - 120, GRID_END_MINUTES + 120);

        expect(rect).toEqual({ top: 0, height: GRID_HEIGHT });
    });

    it('returns null when the window is entirely outside the grid', () => {
        expect(windowRect(0, GRID_START_MINUTES)).toBeNull();
        expect(windowRect(GRID_END_MINUTES, GRID_END_MINUTES + 60)).toBeNull();
    });
});
