import { describe, expect, it } from 'vitest';

import {
    addDaysKey,
    dayWindowPrefetch,
    daysBetweenKeys,
    GRID_END_MINUTES,
    GRID_HEIGHT,
    GRID_START_MINUTES,
    HOUR_HEIGHT,
    timeToMinutes,
    windowDateKeys,
    windowRect,
} from '@/lib/calendar-grid';

describe('addDaysKey / daysBetweenKeys', () => {
    it('advances and measures calendar-date keys, rolling over months', () => {
        expect(addDaysKey('2026-08-30', 3)).toBe('2026-09-02');
        expect(addDaysKey('2026-08-02', -3)).toBe('2026-07-30');
        expect(daysBetweenKeys('2026-08-10', '2026-08-17')).toBe(7);
        expect(daysBetweenKeys('2026-08-17', '2026-08-10')).toBe(-7);
    });
});

describe('windowDateKeys', () => {
    it('lists the consecutive day keys of a window', () => {
        expect(windowDateKeys('2026-08-10', 3)).toEqual([
            '2026-08-10',
            '2026-08-11',
            '2026-08-12',
        ]);
    });
});

describe('dayWindowPrefetch', () => {
    // A cold, centered 7-day window: cursor − 3 … cursor + 3.
    const centered = (cursor: string) => windowDateKeys(addDaysKey(cursor, -3), 7);

    it('prefetches forward once the cursor is within two days of the edge', () => {
        // Cached 08-07 … 08-13; at 08-11 the forward edge (08-13) is two out.
        expect(dayWindowPrefetch(centered('2026-08-10'), '2026-08-11')).toEqual({
            before: null,
            after: '2026-08-14',
        });
    });

    it('prefetches backward once the cursor is within two days of the edge', () => {
        // Cached 08-07 … 08-13; at 08-09 the backward edge (08-07) is two out.
        expect(dayWindowPrefetch(centered('2026-08-10'), '2026-08-09')).toEqual({
            before: '2026-07-31',
            after: null,
        });
    });

    it('does not prefetch from the interior of a cached window', () => {
        expect(dayWindowPrefetch(centered('2026-08-10'), '2026-08-10')).toEqual({
            before: null,
            after: null,
        });
    });

    it('does not prefetch when the cursor day is not cached', () => {
        expect(dayWindowPrefetch(centered('2026-08-10'), '2026-09-01')).toEqual({
            before: null,
            after: null,
        });
    });
});

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
