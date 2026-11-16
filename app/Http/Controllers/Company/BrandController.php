<?php

namespace App\Http\Controllers\Company;

use App\Actions\Teams\UpdateBusinessSettings;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\SaveBookingDesignRequest;
use App\Http\Requests\Company\SaveBrandRequest;
use App\Http\Requests\Company\SaveTeamLanguagesRequest;
use App\Http\Requests\Company\SaveTeamLogoRequest;
use App\Models\Team;
use App\Support\BrandPalette;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    /**
     * Display the team's brand settings.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $user->currentTeam;

        return Inertia::render('company/brand/index', [
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
                'logoUrl' => $team->logoUrl(),
                'brandPrimaryColor' => $team->brand_primary_color,
                'bookingPageDesign' => $team->bookingPageDesign()->value,
                'defaultLocale' => $team->defaultLocale(),
                'availableLocales' => $team->availableLocales(),
            ],
            'permissions' => $user->toTeamPermissions($team),
            'palette' => BrandPalette::forTeam($team),
            'defaultPrimaryColor' => BrandPalette::DEFAULT_PRIMARY,
            'canSelectDesign' => (bool) config('booking.design_switching'),
            'widget' => [
                'scriptUrl' => route('public.widget.script', ['company' => $team->slug]),
                'bookingUrl' => route('public.appointments.show', ['company' => $team->slug]),
            ],
        ]);
    }

    /**
     * Update the team's brand colours.
     *
     * An empty colour clears the choice, which puts the team back on the
     * platform default rather than storing the default explicitly.
     */
    public function update(SaveBrandRequest $request, UpdateBusinessSettings $settings): RedirectResponse
    {
        $settings->brandColor($request->user()->currentTeam, $request->validated('brand_primary_color'));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Brand updated.')]);

        return to_route('company.brand.index');
    }

    /**
     * Update the languages the team's public booking page offers.
     */
    public function updateLanguages(SaveTeamLanguagesRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        $default = $request->validated('default_locale');
        $available = array_values(array_unique($request->validated('available_locales')));

        DB::transaction(function () use ($team, $default, $available): void {
            $locked = Team::whereKey($team->id)->lockForUpdate()->firstOrFail();

            $locked->update([
                'default_locale' => $default,
                'available_locales' => $available,
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Languages updated.')]);

        return to_route('company.brand.index');
    }

    /**
     * Update the design the team's public booking page renders with.
     */
    public function updateDesign(SaveBookingDesignRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        $design = $request->validated('booking_page_design');

        DB::transaction(function () use ($team, $design): void {
            $locked = Team::whereKey($team->id)->lockForUpdate()->firstOrFail();

            $locked->update(['booking_page_design' => $design]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking page design updated.')]);

        return to_route('company.brand.index');
    }

    /**
     * Store or replace the current team's logo.
     */
    public function updateLogo(SaveTeamLogoRequest $request, UpdateBusinessSettings $settings): RedirectResponse
    {
        $settings->storeLogo($request->user()->currentTeam, $request->file('logo'));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Logo updated.')]);

        return to_route('company.brand.index');
    }

    /**
     * Remove the current team's logo.
     */
    public function destroyLogo(Request $request, UpdateBusinessSettings $settings): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        Gate::authorize('update', $team);

        $settings->removeLogo($team);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Logo removed.')]);

        return to_route('company.brand.index');
    }
}
