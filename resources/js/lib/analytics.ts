import posthog from 'posthog-js';

export type ConsentDecision = 'granted' | 'denied';

export type AnalyticsIdentity = {
    id: number;
    team: string | null;
};

export type AnalyticsEvent = {
    id: string;
    name: string;
    properties: Record<string, unknown>;
};

export type AnalyticsProps = {
    identity: AnalyticsIdentity | null;
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

export const CONSENT_STORAGE_KEY = 'uponco-analytics-consent';

const DEFAULT_API_HOST = 'https://eu.i.posthog.com';

/**
 * Read the visitor's stored consent, ignoring anything we didn't write.
 */
export function resolveConsent(stored: string | null): ConsentDecision | null {
    return stored === 'granted' || stored === 'denied' ? stored : null;
}

/**
 * Decide how PostHog should persist a visitor's identity.
 *
 * Cookies are only ever used once a visitor has actively accepted them. An
 * embedded widget stays cookieless no matter what: it runs in a third-party
 * iframe where cookies are partitioned or blocked anyway, and staying
 * cookieless means we never need a consent banner on a customer's own site.
 */
export function resolvePersistence(
    embedded: boolean,
    consent: ConsentDecision | null,
): 'memory' | 'localStorage+cookie' {
    return embedded || consent !== 'granted' ? 'memory' : 'localStorage+cookie';
}

/**
 * The banner is only asked for where a cookie could actually be set, and only
 * until the visitor has made a choice either way.
 */
export function shouldShowConsentBanner(
    configured: boolean,
    embedded: boolean,
    consent: ConsentDecision | null,
): boolean {
    return configured && !embedded && consent === null;
}

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

export function analyticsConfigured(): boolean {
    return Boolean(analyticsKey());
}

/**
 * Detect the embeddable booking widget, which renders inside an iframe on a
 * customer's own site. A cross-origin parent throws on access, which itself
 * means we are embedded.
 */
export function isEmbedded(): boolean {
    try {
        return window.self !== window.top;
    } catch {
        return true;
    }
}

export function currentConsent(): ConsentDecision | null {
    try {
        return resolveConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
    } catch {
        return null;
    }
}

function storeConsent(decision: ConsentDecision): void {
    try {
        window.localStorage.setItem(CONSENT_STORAGE_KEY, decision);
    } catch {
        // A visitor blocking storage still gets cookieless, in-memory tracking.
    }
}

let started = false;
let identifiedAs: string | null = null;
const capturedEventIds = new Set<string>();

function analyticsPropsFor(page: AnalyticsPage): AnalyticsProps | null {
    return (page.props.analytics as AnalyticsProps | undefined) ?? null;
}

function syncIdentity(identity: AnalyticsIdentity | null): void {
    if (identity === null) {
        if (identifiedAs !== null) {
            posthog.reset();
            identifiedAs = null;
        }

        return;
    }

    const distinctId = `user:${identity.id}`;

    if (identifiedAs === distinctId) {
        return;
    }

    posthog.identify(distinctId, { team: identity.team });
    identifiedAs = distinctId;
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

    syncIdentity(analytics?.identity ?? null);
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
 * Boot PostHog for the initial page. Tracking starts cookieless, so a visitor
 * who never answers the banner is still counted without a cookie being set;
 * accepting later upgrades persistence in place.
 */
export function startAnalytics(page: AnalyticsPage): void {
    const key = analyticsKey();

    if (started || typeof window === 'undefined' || !key) {
        return;
    }

    const consent = currentConsent();

    if (consent === 'denied') {
        return;
    }

    const embedded = isEmbedded();

    posthog.init(key, {
        api_host:
            (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ??
            DEFAULT_API_HOST,
        persistence: resolvePersistence(embedded, consent),
        person_profiles: 'identified_only',
        capture_pageview: false,
        autocapture: !embedded,
    });

    started = true;

    trackPageVisit(page);
}

export function grantConsent(): void {
    storeConsent('granted');

    if (started) {
        posthog.set_config({ persistence: 'localStorage+cookie' });
    }
}

export function denyConsent(): void {
    storeConsent('denied');

    if (started) {
        posthog.opt_out_capturing();
        posthog.reset();
    }
}
