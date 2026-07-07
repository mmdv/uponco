import { describe, expect, it } from 'vitest';

import {
    applySelection,
    buildCalendarEvent,
    buildDateTimeLabel,
    buildMetaLabel,
    buildSummary,
    buildUpcomingDaysWithAvailability,
    nextOpenCard,
    resolveBookableDate,
    serviceRequiresLocation,
    slotsKey,
    stepAnimationClass,
} from '@/lib/booking';
import type { SelectionIds, SelectionPools } from '@/lib/booking';
import type {
    AppointmentLocationOption,
    AppointmentServiceOption,
    AppointmentSpecialistOption,
} from '@/types';

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
        delivery_type: 'onsite',
        service_type: 'individual',
        capacity: null,
        category_id: 1,
        category_name: 'Hair',
        location_ids: [10, 11],
        specialist_ids: [20, 21],
        ...overrides,
    };
}

function makeLocation(
    overrides: Partial<AppointmentLocationOption> = {},
): AppointmentLocationOption {
    return {
        id: 10,
        name: 'Downtown',
        service_ids: [1, 2],
        specialist_ids: [20, 21],
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
        service_ids: [1, 2],
        location_ids: [10, 11],
        next_available: null,
        available_days: [],
        ...overrides,
    };
}

function makePools(
    services: AppointmentServiceOption[],
    locations: AppointmentLocationOption[],
    specialists: AppointmentSpecialistOption[],
): SelectionPools {
    return { service: services, location: locations, specialist: specialists };
}

const NO_SELECTION: SelectionIds = {
    service: null,
    location: null,
    specialist: null,
};

describe('slotsKey', () => {
    it('joins the identifying parts of a slot query', () => {
        expect(slotsKey(1, 20, '2026-07-08')).toBe('1:20:2026-07-08');
    });

    it('distinguishes different selections', () => {
        expect(slotsKey(1, 20, '2026-07-08')).not.toBe(
            slotsKey(2, 20, '2026-07-08'),
        );
    });
});

describe('serviceRequiresLocation', () => {
    it('is false for online services', () => {
        expect(
            serviceRequiresLocation(makeService({ delivery_type: 'online' })),
        ).toBe(false);
    });

    it('is true for in-person services', () => {
        expect(
            serviceRequiresLocation(makeService({ delivery_type: 'onsite' })),
        ).toBe(true);
    });

    it('is false for a missing service', () => {
        expect(serviceRequiresLocation(null)).toBe(false);
        expect(serviceRequiresLocation(undefined)).toBe(false);
    });
});

describe('applySelection', () => {
    const services = [
        makeService({ id: 1, location_ids: [10], specialist_ids: [20] }),
        makeService({ id: 2, location_ids: [11], specialist_ids: [21] }),
    ];
    const locations = [
        makeLocation({ id: 10, service_ids: [1], specialist_ids: [20] }),
        makeLocation({ id: 11, service_ids: [2], specialist_ids: [21] }),
    ];
    const specialists = [
        makeSpecialist({ id: 20, service_ids: [1], location_ids: [10] }),
        makeSpecialist({ id: 21, service_ids: [2], location_ids: [11] }),
    ];
    const pools = makePools(services, locations, specialists);

    it('sets the chosen kind', () => {
        const next = applySelection(pools, NO_SELECTION, 'service', 1);

        expect(next.service).toBe(1);
        expect(next.location).toBeNull();
        expect(next.specialist).toBeNull();
    });

    it('keeps compatible existing selections', () => {
        const current: SelectionIds = {
            service: null,
            location: 10,
            specialist: 20,
        };

        const next = applySelection(pools, current, 'service', 1);

        expect(next).toEqual({ service: 1, location: 10, specialist: 20 });
    });

    it('drops selections that are no longer compatible', () => {
        const current: SelectionIds = {
            service: null,
            location: 11,
            specialist: 21,
        };

        // Service 1 only allows location 10 and specialist 20, so the
        // incompatible location 11 and specialist 21 are cleared.
        const next = applySelection(pools, current, 'service', 1);

        expect(next).toEqual({ service: 1, location: null, specialist: null });
    });

    it('drops only the incompatible other selections', () => {
        const current: SelectionIds = {
            service: null,
            location: 10,
            specialist: 21,
        };

        // Service 1 allows location 10 (kept) but not specialist 21 (dropped).
        const next = applySelection(pools, current, 'service', 1);

        expect(next).toEqual({ service: 1, location: 10, specialist: null });
    });

    it('does not mutate the input selection', () => {
        const current: SelectionIds = {
            service: null,
            location: 11,
            specialist: 21,
        };

        applySelection(pools, current, 'service', 1);

        expect(current).toEqual({
            service: null,
            location: 11,
            specialist: 21,
        });
    });

    it('leaves other selections untouched when the value is unknown', () => {
        const current: SelectionIds = {
            service: null,
            location: 11,
            specialist: 21,
        };

        const next = applySelection(pools, current, 'service', 999);

        expect(next).toEqual({
            service: 999,
            location: 11,
            specialist: 21,
        });
    });
});

describe('nextOpenCard', () => {
    const services = [
        makeService({ id: 1, delivery_type: 'onsite' }),
        makeService({ id: 2, delivery_type: 'online' }),
    ];

    it('opens the service card when no service is chosen', () => {
        expect(nextOpenCard(NO_SELECTION, services)).toBe('service');
    });

    it('opens the specialist card once a service is chosen', () => {
        const selection: SelectionIds = {
            service: 1,
            location: null,
            specialist: null,
        };

        expect(nextOpenCard(selection, services)).toBe('specialist');
    });

    it('opens the location card for an in-person service missing a location', () => {
        const selection: SelectionIds = {
            service: 1,
            location: null,
            specialist: 20,
        };

        expect(nextOpenCard(selection, services)).toBe('location');
    });

    it('collapses for an online service without needing a location', () => {
        const selection: SelectionIds = {
            service: 2,
            location: null,
            specialist: 20,
        };

        expect(nextOpenCard(selection, services)).toBeNull();
    });

    it('collapses once everything required is selected', () => {
        const selection: SelectionIds = {
            service: 1,
            location: 10,
            specialist: 20,
        };

        expect(nextOpenCard(selection, services)).toBeNull();
    });
});

describe('resolveBookableDate', () => {
    it('keeps the preferred day when the specialist can take it', () => {
        expect(
            resolveBookableDate('2026-07-09', ['2026-07-08', '2026-07-09']),
        ).toBe('2026-07-09');
    });

    it('falls back to the closest bookable day otherwise', () => {
        expect(
            resolveBookableDate('2026-07-20', ['2026-07-08', '2026-07-09']),
        ).toBe('2026-07-08');
    });

    it('falls back when no day is preferred yet', () => {
        expect(resolveBookableDate('', ['2026-07-08'])).toBe('2026-07-08');
    });

    it('returns an empty string when there are no bookable days', () => {
        expect(resolveBookableDate('2026-07-09', [])).toBe('');
    });
});

describe('buildUpcomingDaysWithAvailability', () => {
    it('returns the requested number of days', () => {
        expect(buildUpcomingDaysWithAvailability(5, []).length).toBe(5);
    });

    it('marks only the specialist available days bookable', () => {
        const days = buildUpcomingDaysWithAvailability(3, []);
        const available = buildUpcomingDaysWithAvailability(3, [days[1].date]);

        expect(available[0].available).toBe(false);
        expect(available[1].available).toBe(true);
        expect(available[2].available).toBe(false);
    });
});

describe('buildMetaLabel', () => {
    it('is undefined without a service', () => {
        expect(buildMetaLabel(null)).toBeUndefined();
    });

    it('joins duration and price', () => {
        const label = buildMetaLabel(
            makeService({ duration: 90, price_type: 'fixed', price: '50' }),
        );

        expect(label).toBe('1h 30m · 50');
    });

    it('omits an empty price', () => {
        const label = buildMetaLabel(
            makeService({ duration: 30, price_type: 'fixed', price: null }),
        );

        expect(label).toBe('30 min');
    });
});

describe('buildDateTimeLabel', () => {
    const tz = 'UTC';

    it('is undefined without a start', () => {
        expect(buildDateTimeLabel('', '', tz)).toBeUndefined();
    });

    it('drops the trailing separator when no end is known', () => {
        const label = buildDateTimeLabel('2026-07-08T09:00:00Z', '', tz);

        expect(label).not.toContain(' · ·');
        expect(label?.endsWith('·')).toBe(true);
    });

    it('includes a time range when an end is known', () => {
        const label = buildDateTimeLabel(
            '2026-07-08T09:00:00Z',
            '2026-07-08T10:00:00Z',
            tz,
        );

        expect(label).toContain('–');
    });
});

describe('buildSummary', () => {
    it('assembles the selected values', () => {
        const summary = buildSummary({
            service: makeService({ title: 'Haircut' }),
            specialist: makeSpecialist({ name: 'Alex' }),
            location: makeLocation({ name: 'Downtown' }),
            requiresLocation: true,
            start: '',
            end: '',
            timezone: 'UTC',
        });

        expect(summary.serviceTitle).toBe('Haircut');
        expect(summary.specialistName).toBe('Alex');
        expect(summary.locationName).toBe('Downtown');
    });

    it('suppresses the location for online services', () => {
        const summary = buildSummary({
            service: makeService({ delivery_type: 'online' }),
            specialist: makeSpecialist(),
            location: makeLocation({ name: 'Downtown' }),
            requiresLocation: false,
            start: '',
            end: '',
            timezone: 'UTC',
        });

        expect(summary.locationName).toBeNull();
    });
});

describe('buildCalendarEvent', () => {
    const base = {
        service: makeService({ title: 'Haircut' }),
        specialist: makeSpecialist({ name: 'Alex' }),
        location: makeLocation({ name: 'Downtown' }),
        requiresLocation: true,
        companyName: 'Acme',
        start: '2026-07-08T09:00:00Z',
        end: '2026-07-08T10:00:00Z',
        notes: 'Please be on time',
    };

    it('is null until a service and a full slot are known', () => {
        expect(buildCalendarEvent({ ...base, service: null })).toBeNull();
        expect(buildCalendarEvent({ ...base, start: '' })).toBeNull();
        expect(buildCalendarEvent({ ...base, end: '' })).toBeNull();
    });

    it('builds a titled event with specialist and notes in the description', () => {
        const event = buildCalendarEvent(base);

        expect(event).not.toBeNull();
        expect(event?.title).toBe('Haircut · Acme');
        expect(event?.location).toBe('Downtown');
        expect(event?.description).toBe('With Alex\nPlease be on time');
    });

    it('omits the location for online services', () => {
        const event = buildCalendarEvent({
            ...base,
            requiresLocation: false,
        });

        expect(event?.location).toBeUndefined();
    });

    it('leaves the description undefined when there is nothing to say', () => {
        const event = buildCalendarEvent({
            ...base,
            specialist: null,
            notes: '   ',
        });

        expect(event?.description).toBeUndefined();
    });
});

describe('stepAnimationClass', () => {
    it('is empty before the first navigation', () => {
        expect(stepAnimationClass(false, 'forward')).toBe('');
    });

    it('slides in from the right when moving forward', () => {
        expect(stepAnimationClass(true, 'forward')).toContain(
            'slide-in-from-right-8',
        );
    });

    it('slides in from the left when moving back', () => {
        expect(stepAnimationClass(true, 'back')).toContain(
            'slide-in-from-left-8',
        );
    });
});
