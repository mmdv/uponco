<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Support\Company\CompanyOverview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The Manage hub's summary for the mobile app: the same team, hours,
 * locations and services overview as the web company page.
 */
class ManageController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json(['data' => CompanyOverview::for($request->user())]);
    }
}
