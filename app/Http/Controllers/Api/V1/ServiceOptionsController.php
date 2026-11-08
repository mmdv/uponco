<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\ServiceCategory;
use App\Models\User;
use App\Support\ServiceOptions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceOptionsController extends Controller
{
    /**
     * The choices the service form needs (same lists as the web page). Enum
     * options are the raw values; the app shows its own translated labels.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $team = $user->currentTeam;

        return response()->json([
            'data' => [
                'categories' => $team->serviceCategories()
                    ->orderBy('name')
                    ->get()
                    ->map(fn (ServiceCategory $category): array => ['value' => $category->id, 'label' => $category->name])
                    ->all(),
                'locations' => $team->locations()
                    ->orderBy('name')
                    ->get()
                    ->map(fn (Location $location): array => ['value' => $location->id, 'label' => $location->name])
                    ->all(),
                'specialists' => $team->members()
                    ->orderBy('name')
                    ->get()
                    ->map(fn (User $member): array => ['value' => $member->id, 'label' => $member->name])
                    ->all(),
                'currencies' => array_column(ServiceOptions::currencies(), 'value'),
                'meeting_providers' => ServiceOptions::meetingProviderKeys(),
                'google' => [
                    'connected' => $user->hasGoogleConnected(),
                    'email' => $user->google_account_email,
                ],
            ],
        ]);
    }
}
