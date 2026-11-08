<?php

namespace App\Http\Resources\V1;

use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Same fields as the web locations page (`LocationController::toLocationArray`).
 *
 * @mixin Location
 */
class LocationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'is_active' => $this->is_active,
            'name' => $this->name,
            'country' => $this->country,
            'city' => $this->city,
            'street_address' => $this->street_address,
            'unit' => $this->unit,
            'postal_code' => $this->postal_code,
            'phone' => $this->phone,
            'place_id' => $this->place_id,
            'formatted_address' => $this->formatted_address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'is_geocoded' => $this->isGeocoded(),
            'service_ids' => $this->whenLoaded('services', fn () => $this->services->pluck('id')->all()),
            'user_ids' => $this->whenLoaded('specialists', fn () => $this->specialists->pluck('id')->all()),
        ];
    }
}
