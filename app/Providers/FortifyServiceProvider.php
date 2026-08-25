<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Http\Responses\LoginResponse;
use App\Http\Responses\PasskeyLoginResponse;
use App\Http\Responses\RegisterResponse;
use App\Http\Responses\TwoFactorLoginResponse;
use App\Http\Responses\VerifyEmailResponse;
use App\Models\TeamInvitation;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse as TwoFactorLoginResponseContract;
use Laravel\Fortify\Contracts\VerifyEmailResponse as VerifyEmailResponseContract;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;
use Laravel\Passkeys\Contracts\PasskeyLoginResponse as PasskeyLoginResponseContract;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LoginResponseContract::class, LoginResponse::class);
        $this->app->singleton(PasskeyLoginResponseContract::class, PasskeyLoginResponse::class);
        $this->app->singleton(RegisterResponseContract::class, RegisterResponse::class);
        $this->app->singleton(TwoFactorLoginResponseContract::class, TwoFactorLoginResponse::class);
        $this->app->singleton(VerifyEmailResponseContract::class, VerifyEmailResponse::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
        $this->configureRouteThrottling();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'status' => $request->session()->get('status'),
            ...$this->invitationProps($request),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn (Request $request) => Inertia::render('auth/register', $this->invitationProps($request)));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Resolve the pending invitation (from the session) so auth screens can
     * prefill and lock the invited email.
     *
     * @return array{invitationEmail?: string, invitationTeam?: ?string}
     */
    private function invitationProps(Request $request): array
    {
        $code = $request->session()->get('team_invitation');

        if (! is_string($code) || $code === '') {
            return [];
        }

        $invitation = TeamInvitation::with('team')->where('code', $code)->first();

        if ($invitation === null || ! $invitation->isPending()) {
            return [];
        }

        return [
            'invitationEmail' => $invitation->email,
            'invitationTeam' => $invitation->team?->name,
        ];
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            // Two limits: the per-account one stops brute forcing a single
            // password, the per-IP one stops spraying one common password
            // across many accounts, which the account key alone never sees.
            return [
                Limit::perMinute(5)->by($throttleKey),
                Limit::perMinute(20)->by($request->ip()),
            ];
        });

        RateLimiter::for('passkeys', function (Request $request) {
            $credentialId = $request->input('credential.id');

            return Limit::perMinute(10)->by(
                ($credentialId ?: $request->session()->getId()).'|'.$request->ip(),
            );
        });
    }

    /**
     * Throttle Fortify routes that Fortify itself leaves unthrottled.
     *
     * Registration and password-reset-link requests are both unauthenticated
     * write endpoints (account creation and outbound email) that Fortify does
     * not rate limit by default, leaving them open to automated abuse and
     * email enumeration. Password reset and password confirmation are both
     * password-guessing surfaces for the same reason. We append a throttle to
     * the named routes once Fortify has registered them.
     */
    private function configureRouteThrottling(): void
    {
        $this->app->booted(function (): void {
            $routes = $this->app->make('router')->getRoutes();
            $routes->refreshNameLookups();

            foreach (['register.store', 'password.email', 'password.update', 'password.confirm.store'] as $name) {
                $routes->getByName($name)?->middleware('throttle:6,1');
            }
        });
    }
}
