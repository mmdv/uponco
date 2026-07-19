import { describe, expect, it } from 'vitest';

import { groupServicesByCategory } from '@/lib/appointments';
import type { AppointmentServiceOption } from '@/types';

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
