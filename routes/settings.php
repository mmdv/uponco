<?php

use App\Http\Controllers\Settings\AccountController;
use App\Http\Controllers\Settings\GoogleIntegrationController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\PushNotificationController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Teams\TeamController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::post('settings/account/avatar', [AccountController::class, 'updateAvatar'])->name('account.avatar.update');
    Route::delete('settings/account/avatar', [AccountController::class, 'destroyAvatar'])->name('account.avatar.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/account', [AccountController::class, 'destroy'])->name('account.destroy');

    // Changing the login email is an account-takeover primitive on its own (the
    // new address can drive a password reset), so it is gated exactly like the
    // password change: verified, throttled, and requiring the current password
    // in the request body (AccountUpdateRequest) rather than the session-scoped
    // password.confirm, which a PATCH cannot redirect back into.
    Route::patch('settings/account', [AccountController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('account.update');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');

    Route::get('settings/push-notifications', [PushNotificationController::class, 'edit'])->name('push-notifications.edit');
    Route::post('settings/push-notifications/subscription', [PushNotificationController::class, 'store'])->name('push-notifications.subscription.store');
    Route::delete('settings/push-notifications/subscription', [PushNotificationController::class, 'destroy'])->name('push-notifications.subscription.destroy');

    Route::get('settings/integrations', [GoogleIntegrationController::class, 'edit'])->name('integrations.edit');
    Route::get('settings/integrations/google/connect', [GoogleIntegrationController::class, 'redirect'])->name('integrations.google.connect');
    Route::get('settings/integrations/google/callback', [GoogleIntegrationController::class, 'callback'])->name('integrations.google.callback');
    Route::delete('settings/integrations/google', [GoogleIntegrationController::class, 'disconnect'])->name('integrations.google.disconnect');

    Route::post('teams', [TeamController::class, 'store'])->name('teams.store');

    Route::post('teams/{team}/switch', [TeamController::class, 'switch'])->name('teams.switch');
});
