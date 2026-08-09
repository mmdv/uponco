import { describe, expect, it } from 'vitest';

import {
    appointmentCustomerLabel,
    appointmentHasCustomer,
    groupServicesByCategory,
} from '@/lib/appointments';
import type { Appointment, AppointmentServiceOption } from '@/types';

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
    return {
        id: 1,
        start_at: '2026-08-10T09:00:00Z',
        end_at: '2026-08-10T10:00:00Z',
        timezone: 'UTC',
        notes: null,
        service: { id: 1, title: 'Haircut' },
        location: null,
        specialist: { id: 20, name: 'Alex' },
        customer: { id: 5, name: 'Jane Doe', email: null, phone: null },
        service_id: 1,
        location_id: null,
        specialist_id: 20,
        ...overrides,
    };
}

function makeService(
    overrides: Partial<AppointmentServiceOption> = {},
): AppointmentServiceOption {
    return {
        id: 1,
        title: 'Haircut',
        description: null,
        duration: 60,
        price_type: 'fixed',
        price: '50',
        price_min: null,
        price_max: null,
        currency: 'EUR',
        delivery_type: 'onsite',
        service_type: 'individual',
        capacity: null,
        category_id: 1,
        category_name: 'Hair',
        location_ids: [10],
        specialist_ids: [20],
        ...overrides,
    };
}

describe('appointmentCustomerLabel', () => {
    it('uses the customer name when present', () => {
        const appointment = makeAppointment({
            customer: { id: 5, name: 'Jane Doe', email: null, phone: null },
            notes: 'ignored note',
        });

        expect(appointmentCustomerLabel(appointment, 'No name')).toBe(
            'Jane Doe',
        );
    });

    it('falls back to the note for a note-only appointment', () => {
        const appointment = makeAppointment({
            customer: { id: null, name: '', email: null, phone: null },
            notes: 'Walk-in, cash payment',
        });

        expect(appointmentCustomerLabel(appointment, 'No name')).toBe(
            'Walk-in, cash payment',
        );
    });

    it('falls back to the placeholder when there is neither name nor note', () => {
        const appointment = makeAppointment({
            customer: { id: null, name: '', email: null, phone: null },
            notes: null,
        });

        expect(appointmentCustomerLabel(appointment, 'No name')).toBe(
            'No name',
        );
    });
});

describe('appointmentHasCustomer', () => {
    it('is true when a customer id is present', () => {
        expect(appointmentHasCustomer(makeAppointment())).toBe(true);
    });

    it('is false for a note-only appointment', () => {
        const appointment = makeAppointment({
            customer: { id: null, name: '', email: null, phone: null },
        });

        expect(appointmentHasCustomer(appointment)).toBe(false);
    });
});

describe('groupServicesByCategory', () => {
    it('groups services under their category', () => {
        const groups = groupServicesByCategory([
            makeService({ id: 1, category_id: 1, category_name: 'Hair' }),
            makeService({ id: 2, category_id: 2, category_name: 'Nails' }),
            makeService({ id: 3, category_id: 1, category_name: 'Hair' }),
        ]);

        expect(groups).toHaveLength(2);
        expect(groups[0]).toMatchObject({ id: 1, name: 'Hair' });
        expect(groups[0].services.map((service) => service.id)).toEqual([1, 3]);
        expect(groups[1]).toMatchObject({ id: 2, name: 'Nails' });
    });

    it('collects uncategorized services into a single null group', () => {
        const groups = groupServicesByCategory([
            makeService({ id: 1, category_id: null, category_name: null }),
            makeService({ id: 2, category_id: null, category_name: null }),
        ]);

        expect(groups).toHaveLength(1);
        expect(groups[0]).toMatchObject({ id: null, name: null });
        expect(groups[0].services.map((service) => service.id)).toEqual([1, 2]);
    });

    it('returns the uncategorized group first', () => {
        const groups = groupServicesByCategory([
            makeService({ id: 1, category_id: 1, category_name: 'Hair' }),
            makeService({ id: 2, category_id: null, category_name: null }),
            makeService({ id: 3, category_id: 2, category_name: 'Nails' }),
        ]);

        expect(groups.map((group) => group.id)).toEqual([null, 1, 2]);
    });

    it('keeps category order when nothing is uncategorized', () => {
        const groups = groupServicesByCategory([
            makeService({ id: 1, category_id: 2, category_name: 'Nails' }),
            makeService({ id: 2, category_id: 1, category_name: 'Hair' }),
        ]);

        expect(groups.map((group) => group.id)).toEqual([2, 1]);
    });

    it('returns no groups for an empty service list', () => {
        expect(groupServicesByCategory([])).toEqual([]);
    });
});
