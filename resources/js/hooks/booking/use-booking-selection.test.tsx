// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useBookingSelection } from '@/hooks/booking/use-booking-selection';
import type {
    AppointmentLocationDetail,
    AppointmentServiceOption,
    AppointmentSpecialistOption,
} from '@/types';

function service(
    overrides: Partial<AppointmentServiceOption> = {},
): AppointmentServiceOption {
    return {
        id: 1,
        title: 'Consultation',
        description: null,
        duration: 60,
        price_type: 'fixed',
        price: '50',
        price_min: null,
        price_max: null,
        currency: 'EUR',
        // Online, so a location is never required and can't gate completeness.
        delivery_type: 'online',
        service_type: 'individual',
        capacity: null,
        category_id: 1,
        category_name: 'General',
        location_ids: [],
        specialist_ids: [20, 21],
        ...overrides,
    };
}

function specialist(
    overrides: Partial<AppointmentSpecialistOption> = {},
): AppointmentSpecialistOption {
    return {
        id: 20,
        name: 'Alex',
        avatar: null,
        service_ids: [1, 2],
        location_ids: [],
        service_durations: {},
        next_available: null,
        available_days: [],
        ...overrides,
    };
}

// Two services and two specialists, so nothing is preselected on arrival.
const services = [service({ id: 1 }), service({ id: 2 })];
const specialists = [specialist({ id: 20 }), specialist({ id: 21 })];
const locations: AppointmentLocationDetail[] = [];

function setup(onSelectionReplaced = vi.fn()) {
    return renderHook(() =>
        useBookingSelection({
            services,
            locations,
            specialists,
            preset: null,
            onSelectionReplaced,
        }),
    );
}

describe('useBookingSelection', () => {
    it('starts with nothing chosen when every kind is a real choice', () => {
        const { result } = setup();

        expect(result.current.serviceId).toBeNull();
        expect(result.current.specialistId).toBeNull();
        expect(result.current.selectionComplete).toBe(false);
        expect(result.current.selectionIsFixed).toBe(false);
    });

    it('records a service, opens the next card, and reports the pool change', () => {
        const onSelectionReplaced = vi.fn();
        const { result } = setup(onSelectionReplaced);

        act(() => result.current.handleServiceChange(1));

        expect(result.current.serviceId).toBe(1);
        expect(onSelectionReplaced).toHaveBeenCalledWith(
            expect.objectContaining({ service: 1 }),
            true,
        );
        // The service was the visitor's; the specialist is the next open card.
        expect(result.current.openCard).toBe('specialist');
    });

    it('is complete once a service and specialist are chosen', () => {
        const { result } = setup();

        act(() => result.current.handleServiceChange(1));
        act(() => result.current.handleSpecialistChange(20));

        expect(result.current.specialistId).toBe(20);
        expect(result.current.selectionComplete).toBe(true);
    });

    it('resets back to the arrival selection', () => {
        const { result } = setup();

        act(() => result.current.handleServiceChange(1));
        act(() => result.current.resetSelection());

        expect(result.current.serviceId).toBeNull();
        expect(result.current.openCard).toBeNull();
    });
});
