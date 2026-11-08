<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\User;
use App\Support\LocationOptions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationOptionsController extends Controller
{
    /**
     * The choices the location form needs: countries, and the team's services
     * and specialists that can be assigned (same lists as the web page).
     */
    public function __invoke(Request $request): JsonResponse
    {
        $team = $request->user()->currentTeam;

        return response()->json([
            'data' => [
                'countries' => LocationOptions::countries(),
                'services' => $team->services()
                    ->orderBy('title')
                    ->get()
                    ->map(fn (Service $service): array => ['value' => $service->id, 'label' => $service->title])
                    ->all(),
                'specialists' => $team->members()
                    ->orderBy('name')
                    ->get()
                    ->map(fn (User $member): array => ['value' => $member->id, 'label' => $member->name])
                    ->all(),
            ],
        ]);
    }
}
