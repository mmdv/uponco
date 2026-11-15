<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterval;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The public marketing routes that are server-side rendered so crawlers
     * receive fully-rendered HTML. Every other route (the authenticated app,
     * which relies on browser-only APIs, the PWA and offline caching) is left
     * client-side rendered.
     *
     * @var list<string>
     */
    private const SSR_ROUTE_NAMES = [
        'home',
        'features',
        'yourData',
        'pricing',
        'privacy',
        'terms',
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Only the authorization code flow is used (AI assistants connecting
        // to the MCP server). Set here, before Passport boots, so its device
        // login routes — which have no page in this app — are never registered.
        Passport::$deviceCodeGrantEnabled = false;
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureInertiaSsr();
        $this->configurePassport();
    }

    /**
     * Configure the OAuth server that AI assistants use to connect to the MCP
     * server (routes/ai.php). Access tokens are short-lived and renewed with
     * the refresh token, so revoking a connection takes effect quickly.
     */
    protected function configurePassport(): void
    {
        Passport::authorizationView(fn (array $parameters) => view('mcp.authorize', $parameters));

        Passport::tokensExpireIn(CarbonInterval::day());
        Passport::refreshTokensExpireIn(CarbonInterval::days(90));

        // Per connected user on /mcp: generous for a conversation (an assistant
        // may chain several tool calls per answer), low enough to stop a runaway loop.
        RateLimiter::for('mcp', fn (Request $request): Limit => Limit::perMinute(120)
            ->by($request->user()?->getAuthIdentifier() ?: $request->ip()));
    }

    /**
     * Restrict server-side rendering to the public marketing pages.
     *
     * SSR is enabled globally in config/inertia.php; the closure is evaluated
     * per request at render time, disabling SSR for anything but the marketing
     * routes so the authenticated SPA keeps rendering purely on the client.
     */
    protected function configureInertiaSsr(): void
    {
        Inertia::disableSsr(fn (): bool => ! self::shouldServerRender(
            request()->route()?->getName(),
        ));
    }

    /**
     * Determine whether the given route should be server-side rendered.
     */
    public static function shouldServerRender(?string $routeName): bool
    {
        return in_array($routeName, self::SSR_ROUTE_NAMES, true);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(8)
                ->letters()
                ->numbers()
                ->uncompromised()
            : null,
        );
    }
}
