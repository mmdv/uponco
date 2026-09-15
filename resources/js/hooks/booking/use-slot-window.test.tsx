// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const reload = vi.fn();

vi.mock('@inertiajs/react', () => ({
    router: { reload: (...args: unknown[]) => reload(...args), post: vi.fn() },
}));

import { useSlotWindow } from '@/hooks/booking/use-slot-window';
import type { UpcomingDay } from '@/lib/appointments';
import type { SelectionIds } from '@/lib/booking';
import type { AppointmentSlot } from '@/types';

function day(date: string): UpcomingDay & { available: boolean } {
    return {
        date,
        weekday: 'Mon',
        day: date.slice(-2),
        month: 'Sep',
        isToday: false,
        isTomorrow: false,
        available: true,
    };
}

const upcomingDays = [day('2026-09-14'), day('2026-09-15'), day('2026-09-20')];

const slot: AppointmentSlot = {
    start: '2026-09-20T09:00:00Z',
    end: '2026-09-20T10:00:00Z',
    label: '09:00',
    available: true,
    remaining: null,
};

const selection: SelectionIds = { service: 1, location: null, specialist: 20 };

function setup(
    slotWindow: Record<string, AppointmentSlot[]> | undefined,
    captureBookingEvent = vi.fn(),
) {
    const view = renderHook(() =>
        useSlotWindow({
            initialSelection: selection,
            slotWindow,
            upcomingDays,
            serviceId: 1,
            specialistId: 20,
            captureBookingEvent,
        }),
    );

    return { ...view, captureBookingEvent };
}

describe('useSlotWindow', () => {
    beforeEach(() => reload.mockClear());

    it('serves a cached day without hitting the server', () => {
        const { result } = setup({ '2026-09-20': [slot] });

        act(() => result.current.showSlotsForDay(1, 20, '2026-09-20'));

        expect(result.current.slots).toEqual([slot]);
        expect(reload).not.toHaveBeenCalled();
    });

    it('reports an empty cached day once', () => {
        const { result, captureBookingEvent } = setup({ '2026-09-20': [] });

        act(() => result.current.showSlotsForDay(1, 20, '2026-09-20'));
        act(() => result.current.showSlotsForDay(1, 20, '2026-09-20'));

        const noSlots = captureBookingEvent.mock.calls.filter(
            ([name]) => name === 'public_booking_no_slots',
        );
        expect(noSlots).toHaveLength(1);
    });

    it('fetches an uncached day and drops a response for a changed selection', () => {
        const { result } = setup(undefined);

        act(() => result.current.showSlotsForDay(1, 20, '2026-09-20'));
        expect(reload).toHaveBeenCalledTimes(1);

        const options = reload.mock.calls[0][0] as {
            onSuccess: (page: { props: unknown }) => void;
        };

        // The visitor changed specialist while the fetch was in flight.
        act(() =>
            result.current.onSelectionReplaced(
                { service: 1, location: null, specialist: 21 },
                true,
            ),
        );
        act(() =>
            options.onSuccess({
                props: { slotWindow: { '2026-09-20': [slot] } },
            }),
        );

        // The late response belonged to the old selection, so it was ignored.
        expect(result.current.slots).toEqual([]);
    });
});
