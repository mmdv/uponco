<?php

namespace App\Actions\Locations;

use App\Http\Requests\Locations\SaveLocationRequest;
use App\Models\Location;
use App\Models\Team;
use Illuminate\Support\Facades\DB;

class SaveLocation
{
    /**
     * Create a location on the team (or update the given one) and assign the
     * services and specialists offered there. Shared by the web company pages
     * and the mobile API.
     */
    public function handle(Team $team, SaveLocationRequest $request, ?Location $location = null): Location
    {
        return DB::transaction(function () use ($team, $request, $location): Location {
            if ($location === null) {
                $location = $team->locations()->create($request->locationData());
            } else {
                $location->update($request->locationData());
            }

            $location->services()->sync($request->serviceIds());
            $location->specialists()->sync($request->specialistIds());

            return $location;
        });
    }
}
