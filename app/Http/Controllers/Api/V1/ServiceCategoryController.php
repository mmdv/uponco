<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Services\DeleteServiceCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceCategories\SaveServiceCategoryRequest;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ServiceCategoryController extends Controller
{
    /**
     * Create a category from the service form ("New category"), with the
     * web's validation (unique name per team).
     */
    public function store(SaveServiceCategoryRequest $request): JsonResponse
    {
        $category = $request->user()->currentTeam->serviceCategories()->create($request->validated());

        return response()->json([
            'data' => ['value' => $category->id, 'label' => $category->name],
        ], Response::HTTP_CREATED);
    }

    /**
     * Rename a category (unique per team, as on the web).
     */
    public function update(SaveServiceCategoryRequest $request, ServiceCategory $serviceCategory): JsonResponse
    {
        $this->authorizeCategory($request, $serviceCategory);

        $serviceCategory->update($request->validated());

        return response()->json(['data' => ['value' => $serviceCategory->id, 'label' => $serviceCategory->name]]);
    }

    /**
     * Delete a category; its services stay, uncategorized.
     */
    public function destroy(Request $request, ServiceCategory $serviceCategory, DeleteServiceCategory $deleteServiceCategory): Response
    {
        $this->authorizeCategory($request, $serviceCategory);

        $deleteServiceCategory->handle($serviceCategory);

        return response()->noContent();
    }

    /**
     * Another team's category is not found.
     */
    protected function authorizeCategory(Request $request, ServiceCategory $serviceCategory): void
    {
        abort_unless($serviceCategory->team_id === $request->user()->currentTeam->id, 404);
    }
}
