<?php

namespace App\Http\Middleware;

use App\Support\Analytics;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'currentTeam' => fn () => $user?->currentTeam ? $user->toUserTeam($user->currentTeam) : null,
            'teams' => fn () => $user?->toUserTeams(includeCurrent: true) ?? [],
            'locale' => app()->getLocale(),
            'availableLocales' => $this->availableLocales(),
            'analytics' => [
                'identity' => fn () => $user ? [
                    'id' => $user->id,
                    'team' => $user->currentTeam?->slug,
                ] : null,
                'events' => Analytics::pending(),
            ],
        ];
    }

    /**
     * The locales that are enabled for selection in the UI.
     *
     * @return list<array{code: string, name: string, native: string}>
     */
    protected function availableLocales(): array
    {
        return collect(config('localization.available'))
            ->filter(fn (array $locale): bool => $locale['enabled'] ?? false)
            ->map(fn (array $locale, string $code): array => [
                'code' => $code,
                'name' => $locale['name'],
                'native' => $locale['native'],
            ])
            ->values()
            ->all();
    }
}
