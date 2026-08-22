<?php

namespace App\Support;

use App\Enums\OnboardingStep;
use App\Http\Controllers\MemberScheduleController;
use App\Models\Location;
use App\Models\OnboardingProgress;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * Builds the props for the onboarding page.
 *
 * The wizard walks the user through creating their first service, filling in
 * their work profile and setting their work hours, so the payload carries every
 * option those forms need in one go — the flow never hits the server for more.
 */
class OnboardingPayload
{
    /**
     * Build the onboarding payload, refreshing the stored progress first so a
     * step the user satisfied elsewhere is already ticked when they arrive.
     *
     * @return array<string, mixed>
     */
    public static function build(Request $request, User $user, Team $team): array
    {
        $progress = self::progress($user, $team);

        return [
            'completed' => $progress->completed_at !== null,
            'currentStep' => $progress->current_step->value,
            'steps' => collect(OnboardingStep::cases())->map(fn (OnboardingStep $step): array => [
                'key' => $step->value,
                'label' => $step->label(),
                'status' => $progress->statusFor($step)->value,
                'mandatory' => $step->isMandatory(),
            ])->all(),
            // The work-hours step changes its range with a partial reload of the
            // slot map alone, so the heavier sections are closures — they only
            // run when the response actually carries them.
            'services' => function () use ($team, $user): array {
                // Loaded once and reused for both the picker options and the
                // full detail cards the location screen shows after a save.
                $locations = $team->locations()
                    ->with(['services:id', 'specialists:id'])
                    ->orderBy('name')
                    ->get();

                return [
                    'categories' => $team->serviceCategories()->orderBy('name')->get()->map(fn (ServiceCategory $category): array => [
                        'id' => $category->id,
                        'name' => $category->name,
                    ]),
                    'services' => $team->services()
                        ->with(['locations:id', 'specialists:id'])
                        ->orderBy('title')
                        ->get()
                        ->map(fn (Service $service): array => self::toServiceArray($service)),
                    // The flow can create a location inline, which needs the same
                    // options the standalone location form uses.
                    'serviceOptions' => self::toOptions($team->services()->orderBy('title')->get(), 'title'),
                    'locations' => self::toOptions($locations, 'name'),
                    // Full location records so the screen can render an address
                    // card and reopen the edit modal after one is created.
                    'locationDetails' => $locations->map(fn (Location $location): array => self::toLocationArray($location)),
                    'specialists' => self::toOptions($team->members()->orderBy('name')->get(), 'name'),
                    'countries' => LocationOptions::countries(),
                    'priceTypes' => ServiceOptions::priceTypes(),
                    'currencies' => ServiceOptions::currencies(),
                    'serviceTypes' => ServiceOptions::serviceTypes(),
                    // Needed so the review screen can reopen the same add wizard
                    // and edit drawer the dashboard uses.
                    'deliveryTypes' => ServiceOptions::deliveryTypes(),
                    'meetingProviders' => ServiceOptions::meetingProviders(),
                    'google' => [
                        'connected' => $user->hasGoogleConnected(),
                        'email' => $user->google_account_email,
                    ],
                ];
            },
            'profile' => fn (): array => [
                'name' => $user->name,
                'email' => $user->profile?->email,
                'phone' => $user->profile?->phone,
                'job_title' => $user->profile?->job_title,
                'description' => $user->profile?->description,
            ],
            // Whoever is setting the business up sets their own hours here;
            // colleagues get theirs from the schedule screens afterwards.
            'schedule' => fn (): array => MemberScheduleController::scheduleFor($request, $team, $user),
            // Gates the step's "Finish" button on exactly what the step update
            // endpoint will accept, so the two can never disagree.
            'hasSchedule' => $progress->hasDataForStep(OnboardingStep::Schedule, $team, $user),
        ];
    }

    /**
     * Load the user's progress for the team, syncing it against the data that
     * actually exists so steps satisfied elsewhere resolve themselves.
     */
    public static function progress(User $user, Team $team): OnboardingProgress
    {
        $progress = OnboardingProgress::firstOrCreate([
            'team_id' => $team->id,
            'user_id' => $user->id,
        ]);

        $progress->syncFromData($team, $user);
        $progress->refreshCompletion();

        if ($progress->isDirty()) {
            $progress->save();
        }

        return $progress;
    }

    /**
     * Map a collection of models into value/label select options.
     *
     * @param  Collection<int, Model>  $models
     * @return Collection<int, array{value: string, label: string}>
     */
    protected static function toOptions($models, string $labelKey)
    {
        return $models->map(fn ($model): array => [
            'value' => (string) $model->id,
            'label' => $model->{$labelKey},
        ]);
    }

    /**
     * Transform a location into its form representation.
     *
     * Mirrors the shape the standalone location form consumes so the onboarding
     * flow can reopen the same edit modal the dashboard uses.
     *
     * @return array<string, mixed>
     */
    protected static function toLocationArray(Location $location): array
    {
        return [
            'id' => $location->id,
            'is_active' => $location->is_active,
            'name' => $location->name,
            'country' => $location->country,
            'city' => $location->city,
            'street_address' => $location->street_address,
            'unit' => $location->unit,
            'postal_code' => $location->postal_code,
            'phone' => $location->phone,
            'place_id' => $location->place_id,
            'formatted_address' => $location->formatted_address,
            'latitude' => $location->latitude,
            'longitude' => $location->longitude,
            'is_geocoded' => $location->isGeocoded(),
            'service_ids' => $location->services->pluck('id')->all(),
            'user_ids' => $location->specialists->pluck('id')->all(),
        ];
    }

    /**
     * Transform a service into its form representation.
     *
     * @return array<string, mixed>
     */
    protected static function toServiceArray(Service $service): array
    {
        return [
            'id' => $service->id,
            'service_category_id' => $service->service_category_id,
            'is_active' => $service->is_active,
            'title' => $service->title,
            'price_type' => $service->price_type->value,
            'price' => $service->price,
            'price_min' => $service->price_min,
            'price_max' => $service->price_max,
            'currency' => $service->currency->value,
            'duration' => $service->duration,
            'technical_break' => $service->technical_break,
            'service_type' => $service->service_type->value,
            'delivery_type' => $service->delivery_type->value,
            'online_meeting_provider' => $service->online_meeting_provider,
            'capacity' => $service->capacity,
            'description' => $service->description,
            'location_ids' => $service->locations->pluck('id')->all(),
            'user_ids' => $service->specialists->pluck('id')->all(),
            'specialist_pricing' => $service->specialists
                ->mapWithKeys(fn (User $specialist): array => [
                    $specialist->id => [
                        'duration' => $specialist->pivot->duration,
                        'price' => $specialist->pivot->price,
                        'price_min' => $specialist->pivot->price_min,
                        'price_max' => $specialist->pivot->price_max,
                    ],
                ])
                ->all(),
        ];
    }
}
