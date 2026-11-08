<?php

namespace App\Http\Resources\V1;

use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Same fields as the web services page (`ServiceController::toServiceArray`).
 *
 * @mixin Service
 */
class ServiceResource extends JsonResource
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
            'service_category_id' => $this->service_category_id,
            'is_active' => $this->is_active,
            'title' => $this->title,
            'price_type' => $this->price_type->value,
            'price' => $this->price,
            'price_min' => $this->price_min,
            'price_max' => $this->price_max,
            'currency' => $this->currency->value,
            'duration' => $this->duration,
            'technical_break' => $this->technical_break,
            'slot_interval' => $this->slot_interval,
            'service_type' => $this->service_type->value,
            'delivery_type' => $this->delivery_type->value,
            'online_meeting_provider' => $this->online_meeting_provider,
            'capacity' => $this->capacity,
            'description' => $this->description,
            'location_ids' => $this->whenLoaded('locations', fn () => $this->locations->pluck('id')->all()),
            'user_ids' => $this->whenLoaded('specialists', fn () => $this->specialists->pluck('id')->all()),
            // Keyed by user id, as a JSON object (never a list) so the app can
            // send it straight back and keep the overrides intact.
            'specialist_pricing' => $this->whenLoaded('specialists', fn () => (object) $this->specialists
                ->mapWithKeys(fn (User $specialist): array => [
                    $specialist->id => [
                        'duration' => $specialist->pivot->duration,
                        'price' => $specialist->pivot->price,
                        'price_min' => $specialist->pivot->price_min,
                        'price_max' => $specialist->pivot->price_max,
                    ],
                ])
                ->all()),
        ];
    }
}
