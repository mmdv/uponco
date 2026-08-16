/**
 * design-sync shim for `@inertiajs/react`.
 *
 * Everything the real package exports is re-exported untouched — components in
 * the bundle keep using the real `Link`, `Form`, `useForm` and `router`. The one
 * override is `usePage()`, which throws outside a live Inertia app ("usePage must
 * be used within the Inertia component"). Since `useTranslation()` calls it, that
 * throw would take down almost every preview card and every design the agent
 * builds, so it returns a static page object instead.
 *
 * Shape mirrors `App\Http\Middleware\HandleInertiaRequests::share()`. Override per
 * preview with `setDsPageProps({...})`.
 *
 * Wired via `compilerOptions.paths` in .design-sync/tsconfig.ds-sync.json.
 */
export * from '../../node_modules/@inertiajs/react/dist/index.js';

type PageProps = Record<string, unknown>;

const defaultProps: PageProps = {
    name: 'Uponco',
    auth: {
        user: {
            id: 1,
            name: 'Ayla Rzayeva',
            email: 'ayla@example.com',
            avatar: null,
            email_verified_at: '2026-01-04T09:00:00.000000Z',
        },
    },
    sidebarOpen: true,
    currentTeam: {
        id: 1,
        name: 'Lumen Studio',
        slug: 'lumen-studio',
        role: 'owner',
        timezone: 'Europe/London',
    },
    teams: [
        { id: 1, name: 'Lumen Studio', slug: 'lumen-studio', role: 'owner' },
    ],
    notificationBell: { unread: 2 },
    termsConsent: null,
    locale: 'en',
    availableLocales: [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'az', name: 'Azerbaijani', native: 'Azərbaycan' },
    ],
    analytics: { identity: null, events: [] },
    flash: {},
    errors: {},
};

const page = {
    component: 'design-preview',
    props: { ...defaultProps },
    url: '/',
    version: null,
    clearHistory: false,
    encryptHistory: false,
    scrollProps: {},
    rememberedState: {},
};

/** Merge extra shared props into the static page every preview sees. */
export function setDsPageProps(props: PageProps): void {
    Object.assign(page.props, props);
}

/** Static stand-in for Inertia's `usePage()` — see the module comment. */
export function usePage(): typeof page {
    return page;
}
