<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\SaveBrandRequest;
use App\Http\Requests\Company\SaveTeamLogoRequest;
use App\Models\Team;
use App\Support\BrandPalette;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
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
            ],
            'permissions' => $user->toTeamPermissions($team),
            'palette' => BrandPalette::forTeam($team),
            'defaultPrimaryColor' => BrandPalette::DEFAULT_PRIMARY,
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
    public function update(SaveBrandRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        $color = BrandPalette::normalise($request->validated('brand_primary_color'));

        DB::transaction(function () use ($team, $color): void {
            $locked = Team::whereKey($team->id)->lockForUpdate()->firstOrFail();

            $locked->update(['brand_primary_color' => $color]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Brand updated.')]);

        return to_route('company.brand.index');
    }

    /**
     * Store or replace the current team's logo.
     */
    public function updateLogo(SaveTeamLogoRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        $path = $request->file('logo')->store('team-logos', 'public');

        DB::transaction(function () use ($team, $path): void {
            $locked = Team::whereKey($team->id)->lockForUpdate()->firstOrFail();

            $previousPath = $locked->logo_path;

            $locked->update(['logo_path' => $path]);

            if ($previousPath && $previousPath !== $path) {
                Storage::disk('public')->delete($previousPath);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Logo updated.')]);

        return to_route('company.brand.index');
    }

    /**
     * Remove the current team's logo.
     */
    public function destroyLogo(Request $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        Gate::authorize('update', $team);

        DB::transaction(function () use ($team): void {
            $locked = Team::whereKey($team->id)->lockForUpdate()->firstOrFail();

            $previousPath = $locked->logo_path;

            $locked->update(['logo_path' => null]);

            if ($previousPath) {
                Storage::disk('public')->delete($previousPath);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Logo removed.')]);

        return to_route('company.brand.index');
    }
}
