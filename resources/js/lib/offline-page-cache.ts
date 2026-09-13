/**
 * Offline page-cache eligibility, factored out of the service worker so it can
 * be unit tested without triggering Workbox's registration side effects.
 */

/**
 * The routes whose data must survive offline, matched at the site root.
 * `/calendar` is the authed appointments dashboard; the public booking pages at
 * `/appointments/{company}` are deliberately not cached into the logged-in shell.
 */
export const OFFLINE_PAGES = /^\/(dashboard|calendar)\/?$/;

/**
 * Inertia partial reloads (e.g. the day view's working hours or slot lookups)
 * request the same page path but return only the `only:` props — an incomplete
 * page. They must never be cached or served as the offline page, so they are
 * excluded here and left to hit the network.
 */
export const isPartialReload = (request: Request): boolean =>
    request.headers.has('X-Inertia-Partial-Data');

/**
 * Whether a request should be handled by the offline page cache: a same-origin
 * GET for a cached page that is not an Inertia partial reload.
 */
export const isCacheablePageRequest = (
    url: URL,
    request: Request,
    origin: string,
): boolean =>
    request.method === 'GET' &&
    url.origin === origin &&
    OFFLINE_PAGES.test(url.pathname) &&
    !isPartialReload(request);
