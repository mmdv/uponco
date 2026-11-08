<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Locations\SaveLocation;
use App\Http\Controllers\Controller;
use App\Http\Requests\Locations\SaveLocationRequest;
use App\Http\Resources\V1\LocationResource;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * The team's locations for the mobile Manage tab (LOC-1, LOC-2). Uses the
 * web's validation (`SaveLocationRequest`) and save logic (`SaveLocation`).
 * Owners and admins only, like the web company pages.
 */
class LocationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return LocationResource::collection(
            $request->user()->currentTeam->locations()
                ->with(['services:id', 'specialists:id'])
                ->orderBy('name')
                ->get(),
        );
    }

    public function show(Request $request, int $location): LocationResource
    {
        return new LocationResource(
            $this->findOnCurrentTeam($request, $location)->load(['services:id', 'specialists:id']),
        );
    }

    public function store(SaveLocationRequest $request, SaveLocation $saveLocation): JsonResponse
    {
        $location = $saveLocation->handle($request->user()->currentTeam, $request);

        return (new LocationResource($location->load(['services:id', 'specialists:id'])))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(SaveLocationRequest $request, SaveLocation $saveLocation, int $location): LocationResource
    {
        $model = $this->findOnCurrentTeam($request, $location);

        $location = $saveLocation->handle($request->user()->currentTeam, $request, $model);

        return new LocationResource($location->load(['services:id', 'specialists:id']));
    }

    /**
     * Look the location up within the current team only, so another team's
     * location is a 404 (its existence is not revealed).
     */
    protected function findOnCurrentTeam(Request $request, int $location): Location
    {
        return $request->user()->currentTeam->locations()->findOrFail($location);
    }
}
