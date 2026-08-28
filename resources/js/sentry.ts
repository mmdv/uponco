import * as Sentry from '@sentry/react';

/**
 * Initialize the Sentry browser SDK.
 *
 * Imported for its side effect as the very first import in `app.tsx` so it runs
 * before any application code. Guarded twice:
 *
 * - Only in the browser. `app.tsx` is also evaluated by Node during Inertia's
 *   SSR pass, where the browser SDK has no business running.
 * - Only when a DSN is configured. Without `VITE_SENTRY_DSN` this is a clean
 *   no-op, so local development keeps working without a Sentry project.
 */
const dsn = import.meta.env.VITE_SENTRY_DSN;

if (typeof document !== 'undefined' && dsn) {
    Sentry.init({
        dsn,
        environment: import.meta.env.MODE,
        release: import.meta.env.VITE_APP_VERSION,

        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],

        // Tracing — sample everything locally, a slice in production.
        tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,

        // Session Replay — a fraction of all sessions, and every session that
        // hits an error.
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,

        enableLogs: true,
    });
}
