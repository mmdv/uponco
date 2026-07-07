<?php

use App\Enums\TeamRole;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\BackofficeController;
use App\Http\Controllers\Company\BrandController;
use App\Http\Controllers\Company\BusinessController;
use App\Http\Controllers\Company\BusinessInvitationController;
use App\Http\Controllers\Company\BusinessMemberController;
use App\Http\Controllers\Company\CompanyController;
use App\Http\Controllers\Company\LocationController;
use App\Http\Controllers\Company\ServiceCategoryController;
use App\Http\Controllers\Company\ServiceController;
use App\Http\Controllers\Company\WorkHoursController;
use App\Http\Controllers\Company\WorkProfileController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OnboardController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\PublicAppointmentController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use App\Http\Middleware\EnsureTeamOnboarded;
use App\Http\Middleware\EnsureUponcoTeam;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::inertia('/privacy', 'legal/privacy')->name('privacy');
Route::inertia('/terms', 'legal/terms')->name('terms');

Route::get('appointments/{company}', [PublicAppointmentController::class, 'show'])
    ->middleware('throttle:60,1')
    ->name('public.appointments.show');
Route::post('appointments/{company}', [PublicAppointmentController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('public.appointments.store');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('onboard', [OnboardController::class, 'show'])->name('onboard.show');
        Route::patch('onboard', [OnboardController::class, 'update'])->name('onboard.update');
    });

// Operator backoffice, restricted to members of the "Uponco" team.
Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class, EnsureUponcoTeam::class])
    ->group(function () {
        Route::get('backoffice', [BackofficeController::class, 'index'])->name('backoffice.index');
        Route::delete('backoffice/teams/{team}', [BackofficeController::class, 'destroyTeam'])->name('backoffice.teams.destroy');
        Route::delete('backoffice/users/{user}', [BackofficeController::class, 'destroyUser'])->name('backoffice.users.destroy');
    });

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class, EnsureTeamOnboarded::class])
    ->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::patch('onboarding/steps/{step}', [OnboardingController::class, 'update'])->name('onboarding.steps.update');

        Route::get('appointments', [AppointmentController::class, 'index'])->name('appointments.index');
        Route::post('appointments', [AppointmentController::class, 'store'])->name('appointments.store');
        Route::patch('appointments/{appointment}', [AppointmentController::class, 'update'])->name('appointments.update');
        Route::patch('appointments/{appointment}/reschedule', [AppointmentController::class, 'reschedule'])->name('appointments.reschedule');
        Route::delete('appointments/{appointment}', [AppointmentController::class, 'destroy'])->name('appointments.destroy');

        Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
        Route::post('customers', [CustomerController::class, 'store'])->name('customers.store');
        Route::patch('customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
        Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');

        // Every team member manages their own work profile and availability.
        Route::get('company/work-profile', [WorkProfileController::class, 'edit'])->name('company.work-profile.edit');
        Route::patch('company/work-profile', [WorkProfileController::class, 'update'])->name('company.work-profile.update');

        Route::get('company/work-hours', [WorkHoursController::class, 'edit'])->name('company.work-hours.edit');
        Route::put('company/work-hours', [WorkHoursController::class, 'update'])->name('company.work-hours.update');

        // Company management (business, team, services, locations, brand) is
        // restricted to admins and owners. Members are gated out entirely.
        Route::middleware(EnsureTeamMembership::class.':'.TeamRole::Admin->value)->group(function () {
            Route::get('company', [CompanyController::class, 'index'])->name('company.index');

            Route::get('company/brand', [BrandController::class, 'index'])->name('company.brand.index');

            Route::redirect('company/business', 'company/business/general')->name('company.business');
            Route::get('company/business/general', [BusinessController::class, 'edit'])->name('company.business.edit');
            Route::patch('company/business/general', [BusinessController::class, 'update'])->name('company.business.update');
            Route::delete('company/business/general', [BusinessController::class, 'destroy'])->name('company.business.destroy');

            Route::post('company/business/general/logo', [BusinessController::class, 'updateLogo'])->name('company.business.logo.update');
            Route::delete('company/business/general/logo', [BusinessController::class, 'destroyLogo'])->name('company.business.logo.destroy');

            Route::get('company/business/members', [BusinessController::class, 'members'])->name('company.business.members.index');
            Route::post('company/business/members', [BusinessMemberController::class, 'store'])->name('company.business.members.store');
            Route::patch('company/business/members/{user}', [BusinessMemberController::class, 'update'])->name('company.business.members.update');
            Route::delete('company/business/members/{user}', [BusinessMemberController::class, 'destroy'])->name('company.business.members.destroy');

            Route::post('company/business/invitations', [BusinessInvitationController::class, 'store'])->name('company.business.invitations.store');
            Route::delete('company/business/invitations/{invitation}', [BusinessInvitationController::class, 'destroy'])->name('company.business.invitations.destroy');

            Route::get('company/locations', [LocationController::class, 'index'])->name('company.locations.index');
            Route::post('company/locations', [LocationController::class, 'store'])->name('company.locations.store');
            Route::patch('company/locations/{location}', [LocationController::class, 'update'])->name('company.locations.update');
            Route::delete('company/locations/{location}', [LocationController::class, 'destroy'])->name('company.locations.destroy');

            Route::get('company/services', [ServiceController::class, 'index'])->name('company.services.index');
            Route::post('company/services', [ServiceController::class, 'store'])->name('company.services.store');
            Route::patch('company/services/{service}', [ServiceController::class, 'update'])->name('company.services.update');
            Route::delete('company/services/{service}', [ServiceController::class, 'destroy'])->name('company.services.destroy');

            Route::post('company/service-categories', [ServiceCategoryController::class, 'store'])->name('company.service-categories.store');
            Route::patch('company/service-categories/{serviceCategory}', [ServiceCategoryController::class, 'update'])->name('company.service-categories.update');
            Route::delete('company/service-categories/{serviceCategory}', [ServiceCategoryController::class, 'destroy'])->name('company.service-categories.destroy');
        });
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
});

require __DIR__.'/settings.php';
