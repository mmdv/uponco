<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceCategories\SaveServiceCategoryRequest;
use Illuminate\Http\JsonResponse;
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
}
