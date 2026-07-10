<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class HandleLocale
{
    /**
     * Resolve the request locale and apply it for the lifetime of the request.
     *
     * Resolution order (restricted to enabled locales): an explicit `locale`
     * cookie set by the language switcher, then the browser's Accept-Language
     * preference, then the configured default.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        App::setLocale($this->resolveLocale($request));

        return $next($request);
    }

    protected function resolveLocale(Request $request): string
    {
        $enabled = $this->enabledLocales();

        $cookie = $request->cookie('locale');

        if (is_string($cookie) && in_array($cookie, $enabled, true)) {
            return $cookie;
        }

        $preferred = $request->getPreferredLanguage($enabled);

        if (is_string($preferred) && in_array($preferred, $enabled, true)) {
            return $preferred;
        }

        return config('localization.default');
    }

    /**
     * @return list<string>
     */
    protected function enabledLocales(): array
    {
        return array_keys(array_filter(
            config('localization.available'),
            fn (array $locale): bool => $locale['enabled'] ?? false,
        ));
    }
}
