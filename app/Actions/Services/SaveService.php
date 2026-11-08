<?php

namespace App\Actions\Services;

use App\Http\Requests\Services\SaveServiceRequest;
use App\Models\Service;
use Illuminate\Support\Facades\DB;

class SaveService
{
    /**
     * Create a service (or update the given one) and assign its locations and
     * specialists, including per-specialist duration/price overrides. Shared
     * by the web company pages and the mobile API.
     */
    public function handle(SaveServiceRequest $request, ?Service $service = null): Service
    {
        return DB::transaction(function () use ($request, $service): Service {
            if ($service === null) {
                $service = Service::create($request->serviceData());
            } else {
                $service->update($request->serviceData());
            }

            $service->locations()->sync($request->locationIds());
            $service->specialists()->sync($request->specialistSyncData());

            return $service;
        });
    }
}
