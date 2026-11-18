<?php

namespace App\Actions\Services;

use App\Models\ServiceCategory;
use Illuminate\Support\Facades\DB;

class DeleteServiceCategory
{
    /**
     * Delete a category, uncategorizing its services. Categories only group
     * services, so deleting one must not take its services with it; the
     * foreign key nulls on delete, but categories soft-delete and never
     * trigger it, so the services are detached explicitly. Shared by the web
     * Services page and the mobile API.
     */
    public function handle(ServiceCategory $category): void
    {
        DB::transaction(function () use ($category): void {
            $category->services()->update(['service_category_id' => null]);

            $category->delete();
        });
    }
}
