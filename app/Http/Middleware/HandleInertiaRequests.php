<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\Analytics;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * How many notifications the header drawer shows before "See all".
     */
    protected const RECENT_NOTIFICATIONS = 10;

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
            'notificationBell' => fn () => $user ? $this->notificationSummary($user) : null,
            'teams' => fn () => $user?->toUserTeams(includeCurrent: true) ?? [],
            'termsConsent' => $this->termsConsent($user),
            'locale' => app()->getLocale(),
            'availableLocales' => $this->availableLocales(),
            'analytics' => [
                'events' => Analytics::pending(),
            ],
        ];
    }

    /**
     * What the app needs to know to ask a user to agree to the terms.
     *
     * Null — the common case — means there is nothing to ask, so the dialog is
     * never mounted. `updated` separates someone who has agreed to an older
     * version (the terms changed under them) from someone who has never agreed
     * at all, because the two need different wording.
     *
     * Shared rather than passed per page because the dialog lives in the app
     * shell: whichever page a user lands on, they are asked.
     *
     * @return array{version: string, updated: bool}|null
     */
    protected function termsConsent(?User $user): ?array
    {
        if ($user === null || $user->hasAcceptedCurrentTerms()) {
            return null;
        }

        return [
            'version' => (string) config('legal.terms_version'),
            'updated' => $user->terms_accepted_at !== null,
        ];
    }

    /**
     * The unread count and recent items behind the header's notification bell.
     *
     * Shared on every authenticated response because the bell lives in the app
     * header rather than on any one page. It is also what the header polls:
     * `router.reload({ only: ['notificationBell'] })` refreshes exactly this.
     *
     * Named for the bell rather than "notifications" so it cannot be shadowed
     * by the paginated `notifications` prop on the notifications page itself.
     *
     * @return array{unread: int, items: list<array<string, mixed>>}
     */
    protected function notificationSummary(User $user): array
    {
        return [
            'unread' => $user->unreadNotifications()->count(),
            'items' => $user->notifications()
                ->latest()
                ->limit(self::RECENT_NOTIFICATIONS)
                ->get()
                ->map(fn (DatabaseNotification $notification): array => [
                    'id' => $notification->id,
                    'read' => $notification->read(),
                    'created_at' => $notification->created_at?->toIso8601String(),
                    ...$notification->data,
                ])
                ->all(),
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
