<?php

use App\Enums\TeamRole;
use App\Http\Controllers\Api\V1\AuthTokenController;
use App\Http\Controllers\Api\V1\CurrentTeamController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\EmailVerificationNotificationController;
use App\Http\Controllers\Api\V1\GoogleTokenController;
use App\Http\Controllers\Api\V1\LegalConsentController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\LocationOptionsController;
use App\Http\Controllers\Api\V1\MeController;
use App\Http\Controllers\Api\V1\PasswordResetLinkController;
use App\Http\Controllers\Api\V1\PushTokenController;
use App\Http\Controllers\Api\V1\ServiceCategoryController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\ServiceOptionsController;
use App\Http\Controllers\Company\AddressLookupController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::post('auth/token', [AuthTokenController::class, 'store'])
        ->middleware('throttle:login')
        ->name('auth.token.store');

    Route::post('auth/google', [GoogleTokenController::class, 'store'])
        ->middleware('throttle:login')
        ->name('auth.google.store');

    Route::post('auth/forgot-password', [PasswordResetLinkController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('auth.password.email');

    Route::middleware('auth:sanctum')->group(function () {
        Route::delete('auth/token', [AuthTokenController::class, 'destroy'])->name('auth.token.destroy');

        Route::post('auth/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
            ->middleware('throttle:6,1')
            ->name('auth.verification.send');

        Route::get('me', MeController::class)->name('me');
        Route::put('me/current-team', [CurrentTeamController::class, 'update'])->name('me.current-team.update');
        Route::post('me/legal-consent', [LegalConsentController::class, 'store'])->name('me.legal-consent.store');

        Route::put('me/push-token', [PushTokenController::class, 'store'])->name('me.push-token.store');
        Route::delete('me/push-token', [PushTokenController::class, 'destroy'])->name('me.push-token.destroy');

        // Business data: same gates as the web app (verified email, member of the
        // current team). Onboarding is gated in the app, not by a redirect here.
        Route::middleware(['verified', EnsureTeamMembership::class])->group(function () {
            Route::get('dashboard', DashboardController::class)->name('dashboard');

            // Business management (the app's Manage tab): owners and admins only,
            // same as the web company pages.
            Route::middleware(EnsureTeamMembership::class.':'.TeamRole::Admin->value)->group(function () {
                Route::get('locations/options', LocationOptionsController::class)->name('locations.options');
                Route::get('locations/address/suggest', [AddressLookupController::class, 'suggest'])
                    ->middleware('throttle:60,1')
                    ->name('locations.address.suggest');
                Route::get('locations/address/resolve', [AddressLookupController::class, 'resolve'])
                    ->middleware('throttle:60,1')
                    ->name('locations.address.resolve');

                Route::get('locations', [LocationController::class, 'index'])->name('locations.index');
                Route::post('locations', [LocationController::class, 'store'])->name('locations.store');
                Route::get('locations/{location}', [LocationController::class, 'show'])
                    ->whereNumber('location')
                    ->name('locations.show');
                Route::patch('locations/{location}', [LocationController::class, 'update'])
                    ->whereNumber('location')
                    ->name('locations.update');

                Route::get('services/options', ServiceOptionsController::class)->name('services.options');
                Route::post('service-categories', [ServiceCategoryController::class, 'store'])->name('service-categories.store');

                Route::get('services', [ServiceController::class, 'index'])->name('services.index');
                Route::post('services', [ServiceController::class, 'store'])->name('services.store');
                Route::get('services/{service}', [ServiceController::class, 'show'])
                    ->whereNumber('service')
                    ->name('services.show');
                Route::patch('services/{service}', [ServiceController::class, 'update'])
                    ->whereNumber('service')
                    ->name('services.update');
                Route::delete('services/{service}', [ServiceController::class, 'destroy'])
                    ->whereNumber('service')
                    ->name('services.destroy');
            });
        });
    });
});
