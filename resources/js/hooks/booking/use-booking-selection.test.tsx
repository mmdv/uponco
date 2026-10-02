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

    it('clears one kind, keeps the others and reports the pool change', () => {
        const onSelectionReplaced = vi.fn();
        const { result } = setup(onSelectionReplaced);

        act(() => result.current.handleServiceChange(1));
        act(() => result.current.handleSpecialistChange(20));
        onSelectionReplaced.mockClear();

        act(() => result.current.clearSelection('specialist'));

        expect(result.current.specialistId).toBeNull();
        expect(result.current.serviceId).toBe(1);
        expect(onSelectionReplaced).toHaveBeenCalledWith(
            expect.objectContaining({ service: 1, specialist: null }),
            true,
        );
    });

    it('never clears a locked kind', () => {
        const onSelectionReplaced = vi.fn();
        // A lone specialist is locked and preselected on arrival.
        const { result } = renderHook(() =>
            useBookingSelection({
                services,
                locations,
                specialists: [specialist({ id: 20 })],
                preset: null,
                onSelectionReplaced,
            }),
        );

        act(() => result.current.clearSelection('specialist'));

        expect(result.current.specialistId).toBe(20);
        expect(onSelectionReplaced).not.toHaveBeenCalled();
    });

    it('clears every choice back to the arrival selection and closes the cards', () => {
        const onSelectionReplaced = vi.fn();
        const { result } = setup(onSelectionReplaced);

        act(() => result.current.handleServiceChange(1));
        act(() => result.current.clearAllSelections());

        expect(result.current.serviceId).toBeNull();
        expect(result.current.openCard).toBeNull();
        expect(onSelectionReplaced).toHaveBeenLastCalledWith(
            { service: null, location: null, specialist: null },
            true,
        );
    });

    it('opens a specific card on request', () => {
        const { result } = setup();

        act(() => result.current.openPicker('specialist'));

        expect(result.current.openCard).toBe('specialist');
    });
});

describe('useBookingSelection single-option fill', () => {
    // One studio, an on-site service at it, and two online services — one of
    // which only specialist 22 offers, and offers nothing else. A mix of online and on-site services
    // means the lone location is not unavoidable on arrival.
    const studio: AppointmentLocationDetail = {
        id: 5,
        name: 'Studio',
        service_ids: [3],
        specialist_ids: [20, 21],
        slug: 'studio',
        address: null,
        city: null,
        phone: null,
        directions_url: null,
        is_geocoded: false,
    };
    const mixedServices = [
        service({ id: 1, specialist_ids: [20, 21] }),
        service({ id: 2, specialist_ids: [22] }),
        service({
            id: 3,
            delivery_type: 'onsite',
            location_ids: [5],
            specialist_ids: [20, 21],
        }),
    ];
    const mixedSpecialists = [
        specialist({ id: 20, service_ids: [1, 3], location_ids: [5] }),
        specialist({ id: 21, service_ids: [1, 3], location_ids: [5] }),
        specialist({ id: 22, service_ids: [2] }),
    ];

    const listedServiceIds = (
        groups: { services: AppointmentServiceOption[] }[],
    ) => groups.flatMap((group) => group.services.map((item) => item.id));

    function setupMixed() {
        return renderHook(() =>
            useBookingSelection({
                services: mixedServices,
                locations: [studio],
                specialists: mixedSpecialists,
                preset: null,
                onSelectionReplaced: vi.fn(),
            }),
        );
    }

    it('picks the only location once an on-site service needs one', () => {
        const { result } = setupMixed();

        expect(result.current.locationId).toBeNull();

        act(() => result.current.handleServiceChange(3));

        expect(result.current.locationId).toBe(5);
        expect(result.current.openCard).toBe('specialist');
    });

    it('picks the only specialist offering the chosen service', () => {
        const { result } = setupMixed();

        act(() => result.current.handleServiceChange(2));

        expect(result.current.specialistId).toBe(22);
        expect(result.current.selectionComplete).toBe(true);
        expect(result.current.openCard).toBeNull();
    });

    it('drops a picked-for-you specialist once the next choice offers more', () => {
        const { result } = setupMixed();

        act(() => result.current.handleServiceChange(2));
        act(() => result.current.handleServiceChange(1));

        expect(result.current.specialistId).toBeNull();
    });

    it('keeps every service listed after picking a specialist or location for the visitor', () => {
        const { result } = setupMixed();

        act(() => result.current.handleServiceChange(2));

        expect(listedServiceIds(result.current.serviceGroups)).toEqual([
            1, 2, 3,
        ]);

        act(() => result.current.handleServiceChange(3));

        expect(result.current.locationId).toBe(5);
        expect(listedServiceIds(result.current.serviceGroups)).toEqual([
            1, 2, 3,
        ]);
    });

    it("keeps the visitor's own specialist when the service changes", () => {
        const { result } = setupMixed();

        act(() => result.current.handleSpecialistChange(21));
        act(() => result.current.handleServiceChange(1));

        expect(result.current.specialistId).toBe(21);
    });
});
