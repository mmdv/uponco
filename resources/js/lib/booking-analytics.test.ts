import { describe, expect, it } from 'vitest';

import type { BookingPreset } from '@/lib/booking';
import {
    bookingDayOffset,
    bookingFunnelBase,
    submitErrorCategory,
} from '@/lib/booking-analytics';

const preset: BookingPreset = {
    type: 'specialist',
    id: 7,
    name: 'Dr. Ada',
    back_url: '/back',
};

describe('bookingFunnelBase', () => {
    it('marks a deep-linked visit as preselected and carries the pool sizes', () => {
        expect(
            bookingFunnelBase({
                company: 'acme',
                preset,
                serviceCount: 3,
                specialistCount: 2,
                locationCount: 1,
            }),
        ).toEqual({
            company: 'acme',
            preselected: true,
            service_count: 3,
            specialist_count: 2,
            location_count: 1,
        });
    });

    it('is not preselected when there is no preset', () => {
        expect(
            bookingFunnelBase({
                company: 'acme',
                preset: null,
                serviceCount: 1,
                specialistCount: 1,
                locationCount: 0,
            }).preselected,
        ).toBe(false);
    });
});

describe('bookingDayOffset', () => {
    const days = [
        { date: '2026-09-14' },
        { date: '2026-09-15' },
        { date: '2026-09-18' },
    ];

    it('counts calendar days from the start of the strip to the chosen day', () => {
        expect(bookingDayOffset(days, '2026-09-14')).toBe(0);
        expect(bookingDayOffset(days, '2026-09-18')).toBe(4);
    });

    it('returns null when there is no strip or no chosen day', () => {
        expect(bookingDayOffset([], '2026-09-14')).toBeNull();
        expect(bookingDayOffset(days, '')).toBeNull();
    });
});

describe('submitErrorCategory', () => {
    it('reports a taken slot before anything else', () => {
        expect(
            submitErrorCategory({ start_at: 'taken', customer_name: 'req' }),
        ).toBe('slot_taken');
    });

    it('reports a stale selection', () => {
        expect(submitErrorCategory({ specialist_id: 'gone' })).toBe(
            'selection',
        );
    });

    it('reports ordinary field validation', () => {
        expect(submitErrorCategory({ customer_email: 'invalid' })).toBe(
            'validation',
        );
    });

    it('falls back to other when there are no known errors', () => {
        expect(submitErrorCategory({})).toBe('other');
    });
});
