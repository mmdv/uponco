// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const post = vi.fn();

vi.mock('@inertiajs/react', () => ({
    router: { post: (...args: unknown[]) => post(...args), reload: vi.fn() },
}));

import { useBookingSubmission } from '@/hooks/booking/use-booking-submission';
import type { BookingErrors } from '@/hooks/booking/use-customer-details';
import { EMPTY_DETAILS } from '@/lib/booking';

type PostOptions = {
    onStart: () => void;
    onSuccess: () => void;
    onError: (errors: BookingErrors) => void;
    onFinish: () => void;
};

const baseParams = () => ({
    company: { name: 'Acme', slug: 'acme' },
    timezone: 'UTC',
    selection: {
        serviceId: 1,
        locationId: null,
        specialistId: 20,
        selectedService: null,
        selectedSpecialist: null,
        selectedLocation: null,
        requiresLocation: false,
    },
    slot: {
        date: '2026-09-20',
        selectedStart: '2026-09-20T09:00:00Z',
        selectedEnd: '2026-09-20T10:00:00Z',
    },
    details: {
        ...EMPTY_DETAILS,
        customer_name: 'Ada',
        customer_email: 'a@b.co',
    },
    validate: vi.fn<() => BookingErrors>(() => ({})),
    setErrors: vi.fn(),
    captureBookingEvent: vi.fn(),
    goToStep: vi.fn(),
    recoverStaleSlot: vi.fn(),
});

describe('useBookingSubmission', () => {
    beforeEach(() => post.mockClear());

    it('blocks the POST and reports the invalid fields when details fail', () => {
        const params = baseParams();
        params.validate = vi.fn<() => BookingErrors>(() => ({
            customer_name: 'Required',
        }));
        const { result } = renderHook(() => useBookingSubmission(params));

        act(() => result.current.handleSubmit());

        expect(post).not.toHaveBeenCalled();
        expect(params.setErrors).toHaveBeenCalledWith({
            customer_name: 'Required',
        });
        expect(params.captureBookingEvent).toHaveBeenCalledWith(
            'public_booking_submit_attempted',
            expect.objectContaining({ valid: false }),
        );
    });

    it('confirms the booking on a successful submission', () => {
        const params = baseParams();
        const { result } = renderHook(() => useBookingSubmission(params));

        act(() => result.current.handleSubmit());
        expect(post).toHaveBeenCalledTimes(1);

        const options = post.mock.calls[0][2] as PostOptions;
        act(() => options.onSuccess());

        expect(result.current.confirmed).not.toBeNull();
        expect(result.current.confirmed?.customerName).toBe('Ada');
    });

    it('recovers the stale day and returns to step 1 when the slot was taken', () => {
        const params = baseParams();
        const { result } = renderHook(() => useBookingSubmission(params));

        act(() => result.current.handleSubmit());
        const options = post.mock.calls[0][2] as PostOptions;
        act(() => options.onError({ start_at: 'That time was just booked.' }));

        expect(params.recoverStaleSlot).toHaveBeenCalledWith(
            1,
            20,
            '2026-09-20',
        );
        expect(params.goToStep).toHaveBeenCalledWith(1);
        expect(params.captureBookingEvent).toHaveBeenCalledWith(
            'public_booking_submit_error',
            { category: 'slot_taken' },
        );
    });

    it('returns to step 0 when the selection went stale', () => {
        const params = baseParams();
        const { result } = renderHook(() => useBookingSubmission(params));

        act(() => result.current.handleSubmit());
        const options = post.mock.calls[0][2] as PostOptions;
        act(() => options.onError({ specialist_id: 'No longer available.' }));

        expect(params.goToStep).toHaveBeenCalledWith(0);
    });
});
