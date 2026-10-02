// @vitest-environment jsdom
import {
    cleanup,
    fireEvent,
    render,
    screen,
    within,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ServicePicker from '@/components/public-booking-v2/service-picker';
import type { ServiceCategoryGroup } from '@/lib/appointments';
import type { AppointmentServiceOption } from '@/types';

// `useTranslation` reads the locale from the Inertia page props.
vi.mock('@inertiajs/react', () => ({
    usePage: () => ({ props: { locale: 'en', availableLocales: [] } }),
}));

afterEach(cleanup);

function service(
    id: number,
    title: string,
    categoryId: number,
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
        delivery_type: 'online',
        service_type: 'individual',
        capacity: null,
        category_id: categoryId,
        category_name: null,
        location_ids: [],
        specialist_ids: [],
    };
}

const groups: ServiceCategoryGroup[] = [
    {
        id: 1,
        name: 'Face',
        services: [service(1, 'Hydrafacial', 1), service(2, 'Peeling', 1)],
    },
    {
        id: 2,
        name: 'Hair',
        services: [service(3, 'Haircut', 2), service(4, 'Colouring', 2)],
    },
];

const renderedServiceIds = () =>
    Array.from(
        document.querySelectorAll<HTMLElement>(
            '[data-test^="booking-service-"]',
        ),
    )
        .map((element) => element.dataset.test)
        .filter((value) => value !== 'booking-service-search');

function setup(onSelect = vi.fn()) {
    render(
        <ServicePicker groups={groups} selectedId={null} onSelect={onSelect} />,
    );

    return onSelect;
}

describe('ServicePicker', () => {
    it('narrows the list as the visitor searches, ignoring case', () => {
        setup();

        fireEvent.change(screen.getByRole('searchbox'), {
            target: { value: 'HAIR' },
        });

        expect(renderedServiceIds()).toEqual([
            'booking-service-3',
            'booking-service-4',
        ]);
    });

    it('filters to one category from its chip', () => {
        setup();

        fireEvent.click(
            document.querySelector('[data-test="booking-category-1"]')!,
        );

        expect(renderedServiceIds()).toEqual([
            'booking-service-1',
            'booking-service-2',
        ]);
    });

    it('offers a way back when nothing matches', () => {
        setup();

        fireEvent.change(screen.getByRole('searchbox'), {
            target: { value: 'massage' },
        });

        expect(renderedServiceIds()).toEqual([]);

        fireEvent.click(
            within(
                document.querySelector<HTMLElement>(
                    '[data-test="booking-picker-empty"]',
                )!,
            ).getByRole('button', { name: 'Clear search' }),
        );

        expect(renderedServiceIds()).toHaveLength(4);
    });

    it('selects a service with a single tap', () => {
        const onSelect = setup();

        fireEvent.click(
            document.querySelector('[data-test="booking-service-2"]')!,
        );

        expect(onSelect).toHaveBeenCalledWith(2);
    });
});
