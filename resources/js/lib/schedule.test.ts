import { describe, expect, it } from 'vitest';

import {
    buildMonthTabs,
    cellDayKey,
    cellId,
    monthDayColumns,
    monthKey,
    todayColumnIndex,
} from '@/lib/schedule';

describe('buildMonthTabs', () => {
    it('returns 24 months spanning six before the reference to seventeen after', () => {
        const tabs = buildMonthTabs(new Date(2026, 6, 10)); // Jul 2026

        expect(tabs).toHaveLength(24);
        expect(tabs[0].key).toBe(monthKey(2026, 0)); // Jan 2026 (6 before)
        expect(tabs[23].key).toBe(monthKey(2027, 11)); // Dec 2027 (17 after)
    });

    it('flags exactly the reference month as current', () => {
        const tabs = buildMonthTabs(new Date(2026, 6, 10));
        const current = tabs.filter((tab) => tab.isCurrent);

        expect(current).toHaveLength(1);
        expect(current[0].key).toBe(monthKey(2026, 6));
    });

    it('wraps across year boundaries when paging back', () => {
        const tabs = buildMonthTabs(new Date(2026, 1, 1)); // Feb 2026

        expect(tabs[0].key).toBe(monthKey(2025, 7)); // Aug 2025
    });
});

describe('monthDayColumns', () => {
    it('produces one column per day with number and weekday labels', () => {
        const columns = monthDayColumns(2026, 6, new Date(2026, 6, 10)); // July

        expect(columns).toHaveLength(31);
        expect(columns[0].dayNumber).toBe('1');
        expect(columns[0].key).toBe('2026-07-01');
        expect(columns[9].weekday).toBe(
            new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(
                new Date(2026, 6, 10),
            ),
        );
    });

    it('marks today only when it falls in the month', () => {
        const inMonth = monthDayColumns(2026, 6, new Date(2026, 6, 10));
        expect(inMonth.filter((column) => column.isToday)).toHaveLength(1);
        expect(inMonth[9].isToday).toBe(true);

        const otherMonth = monthDayColumns(2026, 7, new Date(2026, 6, 10));
        expect(otherMonth.some((column) => column.isToday)).toBe(false);
    });

    it('handles February in a leap year', () => {
        expect(monthDayColumns(2028, 1, new Date(2028, 0, 1))).toHaveLength(29);
    });
});

describe('todayColumnIndex', () => {
    it('returns the index of today, or 0 when absent', () => {
        const columns = monthDayColumns(2026, 6, new Date(2026, 6, 10));
        expect(todayColumnIndex(columns)).toBe(9);

        const otherMonth = monthDayColumns(2026, 7, new Date(2026, 6, 10));
        expect(todayColumnIndex(otherMonth)).toBe(0);
    });
});

describe('cell id helpers', () => {
    it('round-trips the day key', () => {
        const id = cellId(42, '2026-07-10');
        expect(id).toBe('42:2026-07-10');
        expect(cellDayKey(id)).toBe('2026-07-10');
    });
});
