import { describe, expect, it } from 'vitest';

import {
    cardOrder,
    lockedKinds,
    locationIsMandatory,
    nextOpenCard,
    nothingToChoose,
    resolveInitialSelection,
} from '@/lib/booking';
import type { BookingPreset } from '@/lib/booking';
import type {
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSpecialistOption,
} from '@/types';

/*
 * Fixtures here are deliberately minimal — one service, one specialist, one
 * location, each related only to the others' defaults — because these suites
 * are about what happens when a choice has exactly one answer. Widen them per
 * test with overrides rather than making the defaults richer.
 */

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

function makeLocation(
    overrides: Partial<AppointmentLocationOption> = {},
): AppointmentLocationOption {
    return {
        id: 10,
        name: 'Downtown',
        service_ids: [1],
        specialist_ids: [20],
        ...overrides,
    };
}

function makeSpecialist(
    overrides: Partial<AppointmentSpecialistOption> = {},
): AppointmentSpecialistOption {
    return {
        id: 20,
        name: 'Alex',
        avatar: null,
        service_ids: [1],
        location_ids: [10],
        service_durations: {},
        next_available: null,
        available_days: [],
        ...overrides,
    };
}

const preset = (
    overrides: Partial<BookingPreset> & Pick<BookingPreset, 'type' | 'id'>,
): BookingPreset => ({ name: 'Pinned', back_url: '/back', ...overrides });

describe('locationIsMandatory', () => {
    it('follows the chosen service once there is one', () => {
        expect(
            locationIsMandatory(
                [makeService({ delivery_type: 'online' })],
                makeService({ delivery_type: 'onsite' }),
            ),
        ).toBe(true);

        expect(
            locationIsMandatory(
                [makeService()],
                makeService({ delivery_type: 'online' }),
            ),
        ).toBe(false);
    });

    it('is true before a service is chosen only when every service is on-site', () => {
        expect(
            locationIsMandatory(
                [makeService({ id: 1 }), makeService({ id: 2 })],
                null,
            ),
        ).toBe(true);

        expect(
            locationIsMandatory(
                [
                    makeService({ id: 1 }),
                    makeService({ id: 2, delivery_type: 'online' }),
                ],
                null,
            ),
        ).toBe(false);
    });

    it('is false when there are no services at all', () => {
        expect(locationIsMandatory([], null)).toBe(false);
    });
});

describe('resolveInitialSelection', () => {
    it('preselects the only service', () => {
        const selection = resolveInitialSelection(
            {
                services: [makeService()],
                locations: [makeLocation(), makeLocation({ id: 11 })],
                specialists: [
                    makeSpecialist(),
                    makeSpecialist({ id: 21, location_ids: [11] }),
                ],
                // Two locations and two specialists remain choosable.
            },
            null,
        );

        expect(selection.service).toBe(1);
    });

    it('preselects the only specialist', () => {
        const selection = resolveInitialSelection(
            {
                services: [
                    makeService({ id: 1 }),
                    makeService({ id: 2, location_ids: [10, 11] }),
                ],
                locations: [
                    makeLocation({ service_ids: [1, 2] }),
                    makeLocation({ id: 11, service_ids: [2] }),
                ],
                specialists: [
                    makeSpecialist({
                        service_ids: [1, 2],
                        location_ids: [10, 11],
                    }),
                ],
            },
            null,
        );

        expect(selection.specialist).toBe(20);
        expect(selection.service).toBeNull();
    });

    it('preselects the only location when every service is on-site', () => {
        const selection = resolveInitialSelection(
            {
                services: [
                    makeService({ id: 1 }),
                    makeService({ id: 2, specialist_ids: [21] }),
                ],
                locations: [makeLocation({ service_ids: [1, 2] })],
                specialists: [
                    makeSpecialist({ service_ids: [1] }),
                    makeSpecialist({ id: 21, service_ids: [2] }),
                ],
            },
            null,
        );

        expect(selection.location).toBe(10);
    });

    it('leaves the only location unselected when an online service is on offer', () => {
        const selection = resolveInitialSelection(
            {
                services: [
                    makeService({ id: 1 }),
                    makeService({
                        id: 2,
                        delivery_type: 'online',
                        specialist_ids: [21],
                    }),
                ],
                locations: [makeLocation({ service_ids: [1, 2] })],
                specialists: [
                    makeSpecialist({ service_ids: [1] }),
                    makeSpecialist({ id: 21, service_ids: [2] }),
                ],
            },
            null,
        );

        expect(selection.location).toBeNull();
    });

    it('cascades: one service narrows the specialists to one, which narrows the locations to one', () => {
        const selection = resolveInitialSelection(
            {
                services: [makeService({ location_ids: [10] })],
                locations: [
                    makeLocation(),
                    makeLocation({
                        id: 11,
                        service_ids: [2],
                        specialist_ids: [21],
                    }),
                ],
                specialists: [
                    makeSpecialist(),
                    makeSpecialist({ id: 21, service_ids: [2] }),
                ],
            },
            null,
        );

        expect(selection).toEqual({
            service: 1,
            specialist: 20,
            location: 10,
        });
    });

    it('applies a preset and then resolves what it narrows down to one', () => {
        const selection = resolveInitialSelection(
            {
                services: [
                    makeService({ id: 1 }),
                    makeService({
                        id: 2,
                        specialist_ids: [21],
                        location_ids: [11],
                    }),
                ],
                locations: [
                    makeLocation({ service_ids: [1] }),
                    makeLocation({
                        id: 11,
                        service_ids: [2],
                        specialist_ids: [21],
                    }),
                ],
                specialists: [
                    makeSpecialist({ service_ids: [1] }),
                    makeSpecialist({
                        id: 21,
                        service_ids: [2],
                        location_ids: [11],
                    }),
                ],
            },
            preset({ type: 'service', id: 2 }),
        );

        expect(selection).toEqual({
            service: 2,
            specialist: 21,
            location: 11,
        });
    });

    it('preselects nothing when there are two of everything', () => {
        const selection = resolveInitialSelection(
            {
                services: [
                    makeService({
                        id: 1,
                        location_ids: [10, 11],
                        specialist_ids: [20, 21],
                    }),
                    makeService({
                        id: 2,
                        location_ids: [10, 11],
                        specialist_ids: [20, 21],
                    }),
                ],
                locations: [
                    makeLocation({
                        service_ids: [1, 2],
                        specialist_ids: [20, 21],
                    }),
                    makeLocation({
                        id: 11,
                        service_ids: [1, 2],
                        specialist_ids: [20, 21],
                    }),
                ],
                specialists: [
                    makeSpecialist({
                        service_ids: [1, 2],
                        location_ids: [10, 11],
                    }),
                    makeSpecialist({
                        id: 21,
                        service_ids: [1, 2],
                        location_ids: [10, 11],
                    }),
                ],
            },
            null,
        );

        expect(selection).toEqual({
            service: null,
            specialist: null,
            location: null,
        });
    });
});

describe('lockedKinds', () => {
    it('locks a kind with one option or fewer', () => {
        expect(
            lockedKinds({ service: 1, location: 3, specialist: 2 }, null),
        ).toEqual({ service: true, location: false, specialist: false });
    });

    it('locks whatever the deep link pinned, however many options there are', () => {
        expect(
            lockedKinds(
                { service: 4, location: 3, specialist: 2 },
                preset({ type: 'service', id: 1 }),
            ).service,
        ).toBe(true);
    });
});

describe('cardOrder', () => {
    it('leads with a lone specialist and location, leaving the service list last', () => {
        // One specialist, one location, several services.
        expect(
            cardOrder({ specialist: true, location: true, service: false }),
        ).toEqual(['specialist', 'location', 'service']);
    });

    it('falls back to service, specialist, location when nothing is settled', () => {
        expect(
            cardOrder({ specialist: false, location: false, service: false }),
        ).toEqual(['service', 'specialist', 'location']);
    });

    it('floats a lone location above the choices', () => {
        expect(
            cardOrder({ specialist: false, location: true, service: false }),
        ).toEqual(['location', 'service', 'specialist']);
    });

    it('ranks settled sections specialist, service, location', () => {
        expect(
            cardOrder({ specialist: true, location: true, service: true }),
        ).toEqual(['specialist', 'service', 'location']);
    });

    it('always emits all three kinds exactly once', () => {
        for (const specialist of [true, false]) {
            for (const location of [true, false]) {
                for (const service of [true, false]) {
                    expect(
                        cardOrder({ specialist, location, service }).sort(),
                    ).toEqual(['location', 'service', 'specialist']);
                }
            }
        }
    });
});

describe('nextOpenCard', () => {
    const nothing = { service: null, location: null, specialist: null };
    const order = cardOrder({
        specialist: false,
        location: false,
        service: false,
    });

    it('opens the first still-empty section in the rendered order', () => {
        expect(nextOpenCard(nothing, order, true)).toBe('service');
        expect(nextOpenCard({ ...nothing, service: 1 }, order, true)).toBe(
            'specialist',
        );
        expect(
            nextOpenCard(
                { ...nothing, service: 1, specialist: 20 },
                order,
                true,
            ),
        ).toBe('location');
    });

    it('follows a reordered page rather than a fixed sequence', () => {
        expect(
            nextOpenCard(
                nothing,
                cardOrder({ specialist: true, location: true, service: false }),
                true,
            ),
        ).toBe('specialist');
    });

    it('skips the location when it is not on screen', () => {
        expect(
            nextOpenCard(
                { ...nothing, service: 1, specialist: 20 },
                order,
                false,
            ),
        ).toBeNull();
    });

    it('opens nothing once everything on screen is chosen', () => {
        expect(
            nextOpenCard(
                { service: 1, location: 10, specialist: 20 },
                order,
                true,
            ),
        ).toBeNull();
    });
});

describe('nothingToChoose', () => {
    const allLocked = { service: true, location: true, specialist: true };

    it('is true once everything required is locked and selected', () => {
        expect(nothingToChoose(allLocked, true, true)).toBe(true);
    });

    it('ignores the location lock for an online service', () => {
        expect(
            nothingToChoose({ ...allLocked, location: false }, false, true),
        ).toBe(true);
    });

    it('is false while the selection is incomplete', () => {
        expect(nothingToChoose(allLocked, true, false)).toBe(false);
    });

    it('is false while any required kind is still choosable', () => {
        expect(
            nothingToChoose({ ...allLocked, specialist: false }, true, true),
        ).toBe(false);
    });
});
