<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Teams\UpdateBusinessSettings;
use App\Enums\BusinessCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company\SaveBrandRequest;
use App\Http\Requests\Company\SaveTeamLogoRequest;
use App\Http\Requests\Teams\SaveTeamRequest;
use App\Models\Team;
use App\Support\BrandPalette;
use App\Support\LocationOptions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Business details and branding for the mobile app (TEAM-1, BRAND-1/2/5):
 * the same rules and actions as the web Business → General and Brand pages.
 * Reached only by owners and admins (route middleware).
 */
class BusinessController extends Controller
{
    /** The web's preset brand colours (`pages/company/brand/index.tsx`). */
    protected const PRESET_COLORS = [
        '#0063ff', '#4f46e5', '#7c3aed', '#db2777', '#e11d48',
        '#ea580c', '#b45309', '#16a34a', '#0d9488', '#0f172a',
    ];

    /**
     * The business, with the choices its form needs.
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                ...$this->business($request->user()->currentTeam),
                'options' => [
                    'timezones' => array_map(
                        fn (array $timezone): array => ['value' => $timezone['value'], 'label' => $timezone['label']],
                        LocationOptions::timezones(),
                    ),
                    'categories' => BusinessCategory::options(),
                    'preset_colors' => self::PRESET_COLORS,
                    'default_color' => BrandPalette::DEFAULT_PRIMARY,
                ],
            ],
        ]);
    }

    /**
     * Name, booking-page address (slug), timezone and category.
     */
    public function update(SaveTeamRequest $request, UpdateBusinessSettings $settings): JsonResponse
    {
        $team = $request->user()->currentTeam;

        Gate::authorize('update', $team);

        $settings->details($team, $request->validated());

        return response()->json(['data' => $this->business($team)]);
    }

    /**
     * The booking page's colour (null resets to the Uponco blue).
     */
    public function updateBrand(SaveBrandRequest $request, UpdateBusinessSettings $settings): JsonResponse
    {
        $team = $request->user()->currentTeam;

        $settings->brandColor($team, $request->validated('brand_primary_color'));

        return response()->json(['data' => $this->business($team)]);
    }

    public function updateLogo(SaveTeamLogoRequest $request, UpdateBusinessSettings $settings): JsonResponse
    {
        $team = $request->user()->currentTeam;

        $settings->storeLogo($team, $request->file('logo'));

        return response()->json(['data' => $this->business($team)]);
    }

    public function destroyLogo(Request $request, UpdateBusinessSettings $settings): JsonResponse
    {
        $team = $request->user()->currentTeam;

        Gate::authorize('update', $team);

        $settings->removeLogo($team);

        return response()->json(['data' => $this->business($team)]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function business(Team $team): array
    {
        return [
            'id' => $team->id,
            'name' => $team->name,
            'slug' => $team->slug,
            'timezone' => $team->timezone,
            'business_category' => $team->business_category?->value,
            'business_category_other' => $team->business_category_other,
            'logo_url' => $team->logoUrl(),
            'brand_color' => $team->brand_primary_color,
            'booking_url' => route('public.appointments.show', ['company' => $team->slug]),
        ];
    }
}
