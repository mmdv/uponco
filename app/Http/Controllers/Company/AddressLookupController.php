<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Support\Google\GooglePlacesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Proxies Google Places lookups for the location address field.
 *
 * Going through the server keeps the Places API key private and lets the
 * responses be cached, so repeated keystrokes for the same prefix are not
 * billed twice.
 */
class AddressLookupController extends Controller
{
    /**
     * Suggest addresses matching the typed query.
     */
    public function suggest(Request $request, GooglePlacesService $places): JsonResponse
    {
        $validated = $request->validate([
            'query' => ['required', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'size:2'],
        ]);

        $suggestions = cache()->remember(
            'places:suggest:'.md5($validated['query'].'|'.($validated['country'] ?? '')),
            now()->addHours(6),
            fn (): array => $places->autocomplete($validated['query'], $validated['country'] ?? null),
        );

        return response()->json(['suggestions' => $suggestions]);
    }

    /**
     * Resolve a selected suggestion into storable address fields.
     */
    public function resolve(Request $request, GooglePlacesService $places): JsonResponse
    {
        $validated = $request->validate([
            'place_id' => ['required', 'string', 'max:255'],
        ]);

        $details = cache()->remember(
            'places:details:'.md5($validated['place_id']),
            now()->addDay(),
            fn (): ?array => $places->details($validated['place_id']),
        );

        if ($details === null) {
            return response()->json(['message' => __('That address could not be resolved.')], 422);
        }

        return response()->json(['place' => $details]);
    }
}
