/**
 * Inertia's `networkError` event fires on transient XHR failures — losing
 * connectivity, a mobile tab suspended mid-request, a dropped connection — and
 * by default Inertia re-throws the error afterwards. Left unhandled that throw
 * surfaces as an unhandled `HttpNetworkError` rejection, which our error
 * monitoring captures as noise even though nothing is broken in the app.
 *
 * These failures are especially common for the calendar's on-demand
 * `workingHoursWindow` reloads and the public booking `slotWindow` reloads,
 * which fire in the background as the user pages. A failed one is recoverable
 * simply by retrying, so there is nothing actionable to report.
 */

type NetworkErrorEvent = {
    preventDefault: () => void;
};

type Deps = {
    /** Notify the user that they appear to be offline. */
    notifyOffline: () => void;
};

/**
 * Build the `networkError` handler: always cancel Inertia's default re-throw so
 * transient failures stop reaching error monitoring as unhandled rejections,
 * and — only when we can tell the device is offline — surface the offline
 * notice so the user knows why the action did nothing.
 */
export function createNetworkErrorHandler({ notifyOffline }: Deps) {
    return (event: NetworkErrorEvent): void => {
        event.preventDefault();

        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            notifyOffline();
        }
    };
}
