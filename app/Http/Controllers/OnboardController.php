<?php

namespace App\Http\Controllers;

use App\Enums\BusinessCategory;
use App\Http\Requests\Teams\OnboardTeamRequest;
use App\Models\Team;
use App\Support\Analytics;
use App\Support\LocationOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OnboardController extends Controller
{
    /**
     * Show the onboarding gate where the team's core details are collected.
     *
     * Teams that already have their name, category and timezone never reach
     * this page and are sent straight to the dashboard.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        $team = $request->user()->currentTeam;

        if (! $team->needsOnboarding()) {
            return to_route('dashboard', ['current_team' => $team->slug]);
        }

        return Inertia::render('onboard', [
            'team' => [
                'name' => $team->name,
                'timezone' => $team->timezone,
                'businessCategory' => $team->business_category?->value,
            ],
            'timezones' => LocationOptions::timezones(),
            'businessCategories' => BusinessCategory::options(),
        ]);
    }

    /**
     * Persist the team's core details and complete the onboarding gate.
     */
    public function update(OnboardTeamRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        DB::transaction(function () use ($request, $team): void {
            $locked = Team::whereKey($team->id)->lockForUpdate()->firstOrFail();

            $locked->update($request->validated());
        });

        $team->refresh();

        Analytics::record('onboarding_gate_completed', [
            'business_category' => $team->business_category?->value,
            'timezone' => $team->timezone,
        ]);

        return to_route('dashboard', ['current_team' => $team->slug]);
    }
}
