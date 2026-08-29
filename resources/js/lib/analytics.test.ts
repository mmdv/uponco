import { describe, expect, it } from 'vitest';

import type { AnalyticsEvent } from '@/lib/analytics';
import {
    analyticsEventsFrom,
    pageviewProperties,
    unseenEvents,
} from '@/lib/analytics';

function event(id: string): AnalyticsEvent {
    return { id, name: 'signup_completed', properties: {} };
}

describe('unseenEvents', () => {
    it('drops events that were already captured', () => {
        const seen = new Set(['a']);

        expect(unseenEvents([event('a'), event('b')], seen)).toEqual([
            event('b'),
        ]);
    });

    it('keeps every event when none have been seen', () => {
        expect(unseenEvents([event('a'), event('b')], new Set())).toHaveLength(
            2,
        );
    });
});

describe('analyticsEventsFrom', () => {
    it('reads the events the server queued into the analytics prop', () => {
        expect(
            analyticsEventsFrom({
                component: 'public/appointments/book',
                props: { analytics: { events: [event('a'), event('b')] } },
            }),
        ).toEqual([event('a'), event('b')]);
    });

    it('returns an empty list when a page has no analytics prop', () => {
        expect(
            analyticsEventsFrom({
                component: 'public/appointments/book',
                props: {},
            }),
        ).toEqual([]);
    });
});

describe('pageviewProperties', () => {
    it('always reports the page component', () => {
        expect(
            pageviewProperties({ component: 'dashboard', props: {} }),
        ).toEqual({ component: 'dashboard' });
    });

    it('attributes company scoped pages so public traffic can be split per company', () => {
        expect(
            pageviewProperties({
                component: 'public/appointments/book',
                props: { company: { slug: 'acme-salon' } },
            }),
        ).toEqual({
            component: 'public/appointments/book',
            company: 'acme-salon',
        });
    });

    it('ignores a company prop without a usable slug', () => {
        expect(
            pageviewProperties({
                component: 'public/appointments/book',
                props: { company: { name: 'Acme' } },
            }),
        ).toEqual({ component: 'public/appointments/book' });
    });
});
