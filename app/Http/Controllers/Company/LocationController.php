<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Locations\SaveLocationRequest;
use App\Models\Location;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use App\Support\LocationOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    /**
     * Display a listing of the team's locations.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam;

        return Inertia::render('company/locations/index', [
            'locations' => $team->locations()
                ->with(['services:id', 'specialists:id'])
                ->orderBy('name')
                ->get()
                ->map(fn (Location $location): array => $this->toLocationArray($location)),
            'services' => $team->services()
                ->orderBy('title')
                ->get()
                ->map(fn (Service $service): array => [
                    'value' => (string) $service->id,
                    'label' => $service->title,
                ]),
            'specialists' => $team->members()
                ->orderBy('name')
                ->get()
                ->map(fn (User $member): array => [
                    'value' => (string) $member->id,
                    'label' => $member->name,
                ]),
            'countries' => LocationOptions::countries(),
        ]);
    }

    /**
     * Store a newly created location.
     */
    public function store(SaveLocationRequest $request): RedirectResponse
    {
        $location = $request->user()->currentTeam->locations()->create($request->locationData());

        $location->services()->sync($request->serviceIds());
        $location->specialists()->sync($request->specialistIds());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Location created.')]);

        return back();
    }

    /**
     * Update the specified location.
     */
    public function update(SaveLocationRequest $request, string $current_team, Location $location): RedirectResponse
    {
        $this->authorizeLocation($request, $location);

        $location->update($request->locationData());

        $location->services()->sync($request->serviceIds());
        $location->specialists()->sync($request->specialistIds());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Location updated.')]);

        return back();
    }

    /**
     * Delete the specified location.
     */
    public function destroy(Request $request, string $current_team, Location $location): RedirectResponse
    {
        $this->authorizeLocation($request, $location);

        $location->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Location deleted.')]);

        return back();
    }

    /**
     * Ensure the location belongs to the user's current team.
     */
    protected function authorizeLocation(Request $request, Location $location): void
    {
        /** @var Team $team */
        $team = $request->user()->currentTeam;

        abort_unless($location->team_id === $team->id, 403);
    }

    /**
     * Transform a location into its array representation.
     *
     * @return array<string, mixed>
     */
    protected function toLocationArray(Location $location): array
    {
        return [
            'id' => $location->id,
            'is_active' => $location->is_active,
            'name' => $location->name,
            'country' => $location->country,
            'city' => $location->city,
            'street_address' => $location->street_address,
            'unit' => $location->unit,
            'postal_code' => $location->postal_code,
            'phone' => $location->phone,
            'place_id' => $location->place_id,
            'formatted_address' => $location->formatted_address,
            'latitude' => $location->latitude,
            'longitude' => $location->longitude,
            'is_geocoded' => $location->isGeocoded(),
            'service_ids' => $location->services->pluck('id')->all(),
            'user_ids' => $location->specialists->pluck('id')->all(),
        ];
    }
}
