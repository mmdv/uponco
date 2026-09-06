<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class ServiceWorkerController extends Controller
{
    /**
     * Serve the built service worker from the site root.
     *
     * vite-plugin-pwa writes the worker to public/build/sw.js, but it must be
     * registered at `/sw.js` so its scope covers the whole app — Dashboard and
     * Appointments navigations included — without needing a
     * `Service-Worker-Allowed` header. `/sw.js` is never a real file on disk,
     * so this route always handles the request, in every environment.
     */
    public function script(): Response
    {
        $path = public_path('build/sw.js');

        abort_unless(is_file($path), 404);

        // A plain string body rather than response()->file(): a BinaryFileResponse
        // advertises byte-range support, which the service-worker script loader
        // rejects with "An unknown error occurred when fetching the script".
        return response((string) file_get_contents($path), 200, [
            'Content-Type' => 'application/javascript; charset=UTF-8',
            // Always revalidate so a freshly deployed build is picked up
            // promptly; browsers cap service-worker script caching at 24h anyway.
            'Cache-Control' => 'no-cache',
            'Service-Worker-Allowed' => '/',
        ]);
    }
}
