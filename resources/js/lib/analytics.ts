import posthog from 'posthog-js';

export type AnalyticsEvent = {
    id: string;
    name: string;
    properties: Record<string, unknown>;
};

export type AnalyticsProps = {
    events: AnalyticsEvent[];
};

/**
 * The parts of an Inertia page this module reads. Kept structural rather than
 * Inertia's own `Page` so it stays cheap to construct in tests.
 */
type AnalyticsPage = {
    component: string;
    props: Record<string, unknown>;
};

const DEFAULT_API_HOST = 'https://eu.i.posthog.com';

/**
 * Filter out events already captured, so a partial reload that re-sends the
 * same shared props can't double count them.
 */
export function unseenEvents(
    events: AnalyticsEvent[],
    seen: ReadonlySet<string>,
): AnalyticsEvent[] {
    return events.filter((event) => !seen.has(event.id));
}

/**
 * Build the properties for a pageview. Pages scoped to a single company carry
 * the slug so public booking traffic can be broken down per company.
 */
export function pageviewProperties(
    page: AnalyticsPage,
): Record<string, unknown> {
    const properties: Record<string, unknown> = { component: page.component };
    const company = page.props.company as { slug?: unknown } | undefined;

    if (typeof company?.slug === 'string') {
        properties.company = company.slug;
    }

    return properties;
}

function analyticsKey(): string | undefined {
    return import.meta.env.VITE_POSTHOG_KEY as string | undefined;
}

let started = false;
const capturedEventIds = new Set<string>();

function analyticsPropsFor(page: AnalyticsPage): AnalyticsProps | null {
    return (page.props.analytics as AnalyticsProps | undefined) ?? null;
}

function captureServerEvents(events: AnalyticsEvent[]): void {
    for (const event of unseenEvents(events, capturedEventIds)) {
        capturedEventIds.add(event.id);
        posthog.capture(event.name, event.properties);
    }
}

/**
 * Capture a pageview plus anything the server queued for this visit.
 */
export function trackPageVisit(page: AnalyticsPage): void {
    if (!started) {
        return;
    }

    const analytics = analyticsPropsFor(page);

    posthog.capture('$pageview', pageviewProperties(page));
    captureServerEvents(analytics?.events ?? []);
}

/**
 * Capture a client-side event. Safe to call before PostHog is configured.
 */
export function captureEvent(
    name: string,
    properties: Record<string, unknown> = {},
): void {
    if (!started) {
        return;
    }

    posthog.capture(name, properties);
}

/**
 * Boot PostHog for the initial page.
 *
 * Analytics is deliberately anonymous: nothing here identifies a visitor, so
 * PostHog never links a visit back to a named account. Persistence stays in
 * memory (no cookie, no stored device id), autocapture is off (only explicit
 * pageviews and events are sent), and `person_profiles: 'identified_only'`
 * means no person profile is ever created because we never call `identify`.
 * Country geolocation still works: PostHog enriches events from the request IP
 * server-side, and the raw IP is discarded there via the project's
 * "Discard client IP data" setting.
 *
 * Because no personal data or persistent identifier is stored, no cookie
 * consent banner is required.
 */
export function startAnalytics(page: AnalyticsPage): void {
    const key = analyticsKey();

    if (started || typeof window === 'undefined' || !key) {
        return;
    }

    posthog.init(key, {
        api_host:
            (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ??
            DEFAULT_API_HOST,
        persistence: 'memory',
        person_profiles: 'identified_only',
        capture_pageview: false,
        autocapture: false,
    });

    started = true;

    trackPageVisit(page);
}
