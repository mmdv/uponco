<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Services\SaveService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Services\SaveServiceRequest;
use App\Http\Resources\V1\ServiceResource;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * The team's services for the mobile Manage tab (SVC-1..4). Uses the web's
 * validation (`SaveServiceRequest`) and save logic (`SaveService`). Owners
 * and admins only, like the web company pages.
 */
class ServiceController extends Controller
{
    /** Relations the resource needs for assignments and specialist pricing. */
    protected const RELATIONS = ['locations:id', 'specialists:id'];

    public function index(Request $request): AnonymousResourceCollection
    {
        return ServiceResource::collection(
            $request->user()->currentTeam->services()
                ->with(self::RELATIONS)
                ->orderBy('title')
                ->get(),
        );
    }

    public function show(Request $request, int $service): ServiceResource
    {
        return new ServiceResource($this->findOnCurrentTeam($request, $service)->load(self::RELATIONS));
    }

    public function store(SaveServiceRequest $request, SaveService $saveService): JsonResponse
    {
        $service = $saveService->handle($request);

        return (new ServiceResource($service->load(self::RELATIONS)))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(SaveServiceRequest $request, SaveService $saveService, int $service): ServiceResource
    {
        $model = $this->findOnCurrentTeam($request, $service);

        return new ServiceResource($saveService->handle($request, $model)->load(self::RELATIONS));
    }

    /**
     * Soft-deletes the service, as the web does: past appointments keep it.
     */
    public function destroy(Request $request, int $service): Response
    {
        $this->findOnCurrentTeam($request, $service)->delete();

        return response()->noContent();
    }

    /**
     * Look the service up within the current team only, so another team's
     * service is a 404 (its existence is not revealed).
     */
    protected function findOnCurrentTeam(Request $request, int $service): Service
    {
        return $request->user()->currentTeam->services()->findOrFail($service);
    }
}
