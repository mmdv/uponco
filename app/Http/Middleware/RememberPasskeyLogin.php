<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RememberPasskeyLogin
{
    /**
     * Force "remember me" on for passkey sign-in.
     *
     * A passkey is bound to a specific device, so authenticating with one is a
     * strong signal the user owns the machine — there is no reason to drop the
     * session at the end of the browser session. The passkey login request never
     * carries a `remember` flag of its own (the client only sends the
     * credential), so we merge it in before the controller's form request reads
     * it.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->routeIs('passkey.login')) {
            $request->merge(['remember' => true]);
        }

        return $next($request);
    }
}
