<?php

use App\Http\Controllers\Settings\AccountController;
use App\Http\Controllers\Settings\GoogleIntegrationController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Teams\TeamController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('settings/account', [AccountController::class, 'edit'])->name('account.edit');
    Route::patch('settings/account', [AccountController::class, 'update'])->name('account.update');

    Route::post('settings/account/avatar', [AccountController::class, 'updateAvatar'])->name('account.avatar.update');
    Route::delete('settings/account/avatar', [AccountController::class, 'destroyAvatar'])->name('account.avatar.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/account', [AccountController::class, 'destroy'])->name('account.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');

    Route::get('settings/integrations', [GoogleIntegrationController::class, 'edit'])->name('integrations.edit');
    Route::get('settings/integrations/google/connect', [GoogleIntegrationController::class, 'redirect'])->name('integrations.google.connect');
    Route::get('settings/integrations/google/callback', [GoogleIntegrationController::class, 'callback'])->name('integrations.google.callback');
    Route::delete('settings/integrations/google', [GoogleIntegrationController::class, 'disconnect'])->name('integrations.google.disconnect');

    Route::post('teams', [TeamController::class, 'store'])->name('teams.store');

    Route::post('teams/{team}/switch', [TeamController::class, 'switch'])
        ->middleware(EnsureTeamMembership::class)
        ->name('teams.switch');
});
