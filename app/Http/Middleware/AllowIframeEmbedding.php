<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AllowIframeEmbedding
{
    /**
     * Allow this response to be embedded in an <iframe> on any origin.
     *
     * The public booking page is embedded on customers' own websites via the
     * booking widget, so it must not be blocked by frame-busting headers. A
     * `Content-Security-Policy: frame-ancestors` directive is honored by modern
     * browsers even when a platform proxy also sends `X-Frame-Options: deny`,
     * so we set it here and clear the header we control.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->remove('X-Frame-Options');
        $response->headers->set('Content-Security-Policy', 'frame-ancestors *;');

        return $response;
    }
}
