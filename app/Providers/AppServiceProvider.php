<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

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
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureInertiaSsr();
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
