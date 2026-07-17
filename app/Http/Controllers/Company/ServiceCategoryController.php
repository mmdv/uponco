<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceCategories\SaveServiceCategoryRequest;
use App\Models\ServiceCategory;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ServiceCategoryController extends Controller
{
    /**
     * Store a newly created service category.
     */
    public function store(SaveServiceCategoryRequest $request): RedirectResponse
    {
        $request->user()->currentTeam->serviceCategories()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category created.')]);

        return back();
    }

    /**
     * Update the specified service category.
     */
    public function update(SaveServiceCategoryRequest $request, string $current_team, ServiceCategory $serviceCategory): RedirectResponse
    {
        $this->authorizeCategory($request, $serviceCategory);

        $serviceCategory->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category updated.')]);

        return back();
    }

    /**
     * Delete the specified service category, uncategorizing its services.
     *
     * Categories only group services, so deleting one must not take its services
     * with it. The foreign key nulls on delete, but categories soft-delete and
     * never trigger it, so the services are detached explicitly.
     */
    public function destroy(Request $request, string $current_team, ServiceCategory $serviceCategory): RedirectResponse
    {
        $this->authorizeCategory($request, $serviceCategory);

        DB::transaction(function () use ($serviceCategory): void {
            $serviceCategory->services()->update(['service_category_id' => null]);

            $serviceCategory->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category deleted.')]);

        return back();
    }

    /**
     * Ensure the category belongs to the user's current team.
     */
    protected function authorizeCategory(Request $request, ServiceCategory $serviceCategory): void
    {
        /** @var Team $team */
        $team = $request->user()->currentTeam;

        abort_unless($serviceCategory->team_id === $team->id, 403);
    }
}
