<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\SessionGuard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

class RefreshRememberCookie
{
    /**
     * How long a refreshed "remember me" cookie is valid for, in minutes.
     *
     * This matches Laravel's own recaller duration, which is also the longest
     * expiry browsers will honour on a cookie — Safari and Chrome both clamp
     * anything further out to 400 days.
     */
    private const DURATION_IN_MINUTES = 400 * 24 * 60;

    /**
     * Re-issue the "remember me" cookie on every authenticated response.
     *
     * Laravel writes the recaller cookie once, at login, and never touches it
     * again. That is fine in a desktop browser but not in the installed iOS
     * app: WebKit is known to drop or roll back cookies belonging to a home
     * screen web app, and a cookie that is only ever written once has no way to
     * recover — the next launch lands on the login screen even though the sign
     * in was supposed to last for months.
     *
     * Writing the same value back on each response makes the window rolling
     * rather than fixed, so someone who opens the app regularly is never logged
     * out, and it repairs a cookie WebKit reverted to an older value. The value
     * is copied verbatim from the request, so nothing is recomputed and the
     * cookie stays encrypted and HTTP-only exactly as Laravel issued it.
     *
     * @see https://bugs.webkit.org/show_bug.cgi?id=272325
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $guard = Auth::guard();

        if (! $guard instanceof SessionGuard) {
            return $response;
        }

        $name = $guard->getRecallerName();
        $recaller = $request->cookies->get($name);

        // Skip whenever the guard already has something to say about the
        // cookie: logging in queues a fresh one and logging out queues its
        // deletion, and overwriting either would break that request.
        if (! is_string($recaller) || Cookie::hasQueued($name) || ! $guard->check()) {
            return $response;
        }

        Cookie::queue(Cookie::make($name, $recaller, self::DURATION_IN_MINUTES));

        return $response;
    }
}
