import { describe, expect, it } from 'vitest';

import type { ServiceCategoryGroup } from '@/lib/appointments';
import {
    filterServiceGroups,
    highlightParts,
    matchesSearch,
    normalizeSearch,
} from '@/lib/booking-search';
import type { AppointmentServiceOption } from '@/types';

function service(
    id: number,
    title: string,
    overrides: Partial<AppointmentServiceOption> = {},
): AppointmentServiceOption {
    return {
        id,
        title,
        description: null,
        duration: 60,
        price_type: 'fixed',
        price: '50',
        price_min: null,
        price_max: null,
        currency: 'EUR',
        delivery_type: 'on_site',
        service_type: 'individual',
        capacity: null,
        category_id: null,
        category_name: null,
        location_ids: [],
        specialist_ids: [],
        ...overrides,
    } as AppointmentServiceOption;
}

const groups: ServiceCategoryGroup[] = [
    {
        id: 1,
        name: 'Üz baxımı',
        services: [
            service(1, 'Lazer epilyasiya'),
            service(2, 'Hydrafacial', { description: 'Dərin təmizləmə' }),
        ],
    },
    {
        id: 2,
        name: 'Saç',
        services: [service(3, 'Saç kəsimi'), service(4, 'Boyama')],
    },
];

describe('normalizeSearch', () => {
    it('folds case, accents and Azerbaijani letters', () => {
        expect(normalizeSearch('  Saç Kəsimi ')).toBe('sac kesimi');
        expect(normalizeSearch('ÜZ BAXIMI')).toBe('uz baximi');
        expect(normalizeSearch('Işıq')).toBe('isiq');
        expect(normalizeSearch('Crème Brûlée')).toBe('creme brulee');
    });
});

describe('matchesSearch', () => {
    it('matches when every word appears in some field', () => {
        expect(matchesSearch(['Laser face', 'Skin'], 'skin laser')).toBe(true);
        expect(matchesSearch(['Laser face', 'Skin'], 'laser hair')).toBe(false);
    });

    it('matches everything for an empty query and ignores missing fields', () => {
        expect(matchesSearch([null, undefined], '   ')).toBe(true);
        expect(matchesSearch([null, 'Pilates'], 'pil')).toBe(true);
    });
});

describe('filterServiceGroups', () => {
    it('filters by title and description without accents', () => {
        const result = filterServiceGroups(groups, 'derin', null);

        expect(result).toHaveLength(1);
        expect(result[0].services.map((item) => item.id)).toEqual([2]);
    });

    it('lists a whole category when the query names it', () => {
        const result = filterServiceGroups(groups, 'sac', null);

        expect(result.map((group) => group.id)).toEqual([2]);
        expect(result[0].services).toHaveLength(2);
    });

    it('narrows to one category and drops groups left empty', () => {
        expect(filterServiceGroups(groups, '', 1)).toHaveLength(1);
        expect(filterServiceGroups(groups, 'boyama', 1)).toEqual([]);
    });
});

describe('highlightParts', () => {
    it('marks each matching word in the original spelling', () => {
        expect(highlightParts('Saç kəsimi', 'sac kes')).toEqual([
            { text: 'Saç', match: true },
            { text: ' ', match: false },
            { text: 'kəs', match: true },
            { text: 'imi', match: false },
        ]);
    });

    it('returns the text whole when there is nothing to highlight', () => {
        expect(highlightParts('Boyama', '')).toEqual([
            { text: 'Boyama', match: false },
        ]);
    });
});
