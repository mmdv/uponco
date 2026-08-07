import { describe, expect, it } from 'vitest';

import { dateKey } from '@/lib/calendar-grid';
import {
    DEFAULT_SLOT,
    formatHours,
    initialSlotsForDays,
    isPastDay,
    repeatWeekPayload,
    shiftAnchor,
    slotMinutes,
    totalMinutesForDays,
    viewDays,
    viewRange,
} from '@/lib/member-schedule';
import type { DayScheduleMap } from '@/types/schedule';

/** Wednesday 12 August 2026. */
const WEDNESDAY = new Date(2026, 7, 12);

describe('viewDays', () => {
    it('returns the Mon–Sun week containing the anchor', () => {
        const days = viewDays('week', WEDNESDAY);

        expect(days).toHaveLength(7);
        expect(dateKey(days[0])).toBe('2026-08-10');
        expect(dateKey(days[6])).toBe('2026-08-16');
    });

    it('returns the six-week grid for a month', () => {
        const days = viewDays('month', WEDNESDAY);

        expect(days).toHaveLength(42);
        // August 2026 starts on a Saturday, so the grid opens in July.
        expect(dateKey(days[0])).toBe('2026-07-27');
    });
});

describe('viewRange', () => {
    it('spans the first and last day of the view', () => {
        expect(viewRange('week', WEDNESDAY)).toEqual({
            from: '2026-08-10',
            to: '2026-08-16',
        });
    });
});

describe('shiftAnchor', () => {
    it('steps a week at a time in week view', () => {
        expect(dateKey(shiftAnchor('week', WEDNESDAY, 1))).toBe('2026-08-19');
        expect(dateKey(shiftAnchor('week', WEDNESDAY, -1))).toBe('2026-08-05');
    });

    it('steps whole months without skipping short ones', () => {
        const march31 = new Date(2026, 2, 31);

        expect(dateKey(shiftAnchor('month', march31, -1))).toBe('2026-02-01');
    });
});

describe('slotMinutes', () => {
    it('measures a block', () => {
        expect(slotMinutes({ start: '09:00', end: '17:30' })).toBe(510);
    });

    it('is zero for a malformed or backwards block', () => {
        expect(slotMinutes({ start: '17:00', end: '09:00' })).toBe(0);
        expect(slotMinutes({ start: '', end: '' })).toBe(0);
    });
});

describe('totalMinutesForDays', () => {
    it('sums every block across the given days', () => {
        const slots: DayScheduleMap = {
            '2026-08-10': [
                { start: '09:00', end: '12:00' },
                { start: '13:00', end: '17:00' },
            ],
            '2026-08-11': [{ start: '10:00', end: '14:00' }],
        };

        expect(totalMinutesForDays(slots, viewDays('week', WEDNESDAY))).toBe(
            420 + 240,
        );
    });
});

describe('formatHours', () => {
    it('drops the minutes when they are zero', () => {
        expect(formatHours(0)).toBe('0h');
        expect(formatHours(480)).toBe('8h');
        expect(formatHours(450)).toBe('7h 30m');
    });
});

describe('isPastDay', () => {
    it('is true only strictly before today', () => {
        const today = new Date(2026, 7, 12);

        expect(isPastDay(new Date(2026, 7, 11), today)).toBe(true);
        expect(isPastDay(today, today)).toBe(false);
        expect(isPastDay(new Date(2026, 7, 13), today)).toBe(false);
    });
});

describe('repeatWeekPayload', () => {
    const week = viewDays('week', WEDNESDAY);
    const slots: DayScheduleMap = {
        '2026-08-10': [{ start: '09:00', end: '17:00' }],
        '2026-08-11': [{ start: '10:00', end: '14:00' }],
    };

    it('emits every day of every repeated week', () => {
        const payload = repeatWeekPayload(week, slots, 2, WEDNESDAY);

        expect(payload).toHaveLength(14);
        expect(payload[0]).toEqual({
            date: '2026-08-17',
            slots: [{ start: '09:00', end: '17:00' }],
        });
    });

    it('carries days off forward as empty days', () => {
        const payload = repeatWeekPayload(week, slots, 1, WEDNESDAY);
        const wednesday = payload.find((day) => day.date === '2026-08-19');

        expect(wednesday?.slots).toEqual([]);
    });

    it('never writes to a date in the past', () => {
        // Repeating from a week far in the past would otherwise rewrite history.
        const today = new Date(2026, 8, 1);
        const payload = repeatWeekPayload(week, slots, 2, today);

        expect(payload.every((day) => day.date >= '2026-09-01')).toBe(true);
    });

    it('copies blocks rather than sharing them', () => {
        const payload = repeatWeekPayload(week, slots, 1, WEDNESDAY);
        const monday = payload.find((day) => day.date === '2026-08-17');

        expect(monday?.slots[0]).not.toBe(slots['2026-08-10'][0]);
    });
});

describe('initialSlotsForDays', () => {
    // Deliberately not the 09:00–17:00 default, so a pre-fill is
    // distinguishable from the fallback.
    const shared = { start: '08:00', end: '12:00' };
    const slots: DayScheduleMap = {
        '2026-08-10': [shared],
        '2026-08-11': [shared],
        '2026-08-12': [{ start: '10:00', end: '14:00' }],
    };

    it('pre-fills when every selected day already matches', () => {
        expect(
            initialSlotsForDays(['2026-08-10', '2026-08-11'], slots),
        ).toEqual([shared]);
    });

    it('falls back to a default block when the days differ', () => {
        expect(
            initialSlotsForDays(['2026-08-10', '2026-08-12'], slots),
        ).toEqual([DEFAULT_SLOT]);
    });

    it('falls back when only some of the days have hours', () => {
        expect(
            initialSlotsForDays(['2026-08-10', '2026-08-20'], slots),
        ).toEqual([DEFAULT_SLOT]);
    });

    it('falls back for a day with no hours yet', () => {
        expect(initialSlotsForDays(['2026-08-20'], slots)).toEqual([
            DEFAULT_SLOT,
        ]);
    });

    it('copies the blocks rather than sharing them', () => {
        const result = initialSlotsForDays(['2026-08-10'], slots);

        expect(result[0]).not.toBe(shared);
    });
});
