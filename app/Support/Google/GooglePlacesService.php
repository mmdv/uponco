<?php

namespace App\Support\Google;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

/**
 * Thin wrapper around the Google Places API (New) used to turn a partly typed
 * address into a real, geocoded place.
 *
 * The API key stays server side — the browser talks to our own endpoints and
 * never sees it, so the key can be locked down to this application's IPs.
 */
class GooglePlacesService
{
    /**
     * Google's Places API (New) autocomplete endpoint.
     */
    protected const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';

    /**
     * Google's Places API (New) place details endpoint.
     */
    protected const DETAILS_URL = 'https://places.googleapis.com/v1/places/';

    /**
     * Whether the integration is configured. When it isn't, the address form
     * silently falls back to plain manual entry rather than breaking.
     */
    public function isConfigured(): bool
    {
        return filled(config('services.google.places_key'));
    }

    /**
     * Suggest addresses for a partly typed query.
     *
     * @return array<int, array{place_id: string, main_text: string, secondary_text: string}>
     */
    public function autocomplete(string $input, ?string $country = null): array
    {
        if (! $this->isConfigured() || trim($input) === '') {
            return [];
        }

        $payload = ['input' => $input];

        if ($country) {
            $payload['includedRegionCodes'] = [strtolower($country)];
        }

        $response = Http::withHeaders([
            'X-Goog-Api-Key' => config('services.google.places_key'),
        ])->post(self::AUTOCOMPLETE_URL, $payload);

        if ($response->failed()) {
            report(new \RuntimeException('Google Places autocomplete failed: '.$response->body()));

            return [];
        }

        return collect($response->json('suggestions', []))
            ->filter(fn (array $suggestion): bool => filled(data_get($suggestion, 'placePrediction.placeId')))
            ->map(fn (array $suggestion): array => [
                'place_id' => data_get($suggestion, 'placePrediction.placeId'),
                'main_text' => (string) data_get($suggestion, 'placePrediction.structuredFormat.mainText.text', ''),
                'secondary_text' => (string) data_get($suggestion, 'placePrediction.structuredFormat.secondaryText.text', ''),
            ])
            ->values()
            ->all();
    }

    /**
     * Resolve a place id into the address fields and coordinates we store.
     *
     * @return array{place_id: string, formatted_address: string, latitude: float, longitude: float, street_address: string, city: string, postal_code: string, country: string}|null
     */
    public function details(string $placeId): ?array
    {
        if (! $this->isConfigured() || trim($placeId) === '') {
            return null;
        }

        $response = Http::withHeaders([
            'X-Goog-Api-Key' => config('services.google.places_key'),
            'X-Goog-FieldMask' => 'id,formattedAddress,location,addressComponents',
        ])->get(self::DETAILS_URL.$placeId);

        if ($response->failed()) {
            report(new \RuntimeException('Google Places details failed: '.$response->body()));

            return null;
        }

        $latitude = data_get($response->json(), 'location.latitude');
        $longitude = data_get($response->json(), 'location.longitude');

        if ($latitude === null || $longitude === null) {
            return null;
        }

        $components = collect($response->json('addressComponents', []));

        $streetNumber = $this->component($components, 'street_number');
        $route = $this->component($components, 'route');

        return [
            'place_id' => (string) $response->json('id', $placeId),
            'formatted_address' => (string) $response->json('formattedAddress', ''),
            'latitude' => (float) $latitude,
            'longitude' => (float) $longitude,
            'street_address' => trim($route.' '.$streetNumber) ?: $route,
            'city' => $this->component($components, 'locality')
                ?: $this->component($components, 'postal_town')
                ?: $this->component($components, 'administrative_area_level_1'),
            'postal_code' => $this->component($components, 'postal_code'),
            'country' => strtoupper($this->component($components, 'country', short: true)),
        ];
    }

    /**
     * Pull a single component out of a Places address component list.
     *
     * @param  Collection<int, array<string, mixed>>  $components
     */
    protected function component(Collection $components, string $type, bool $short = false): string
    {
        $match = $components->first(
            fn (array $component): bool => in_array($type, (array) data_get($component, 'types', []), true),
        );

        return (string) data_get($match, $short ? 'shortText' : 'longText', '');
    }
}
