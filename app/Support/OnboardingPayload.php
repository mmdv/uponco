<?php

namespace App\Support;

use App\Enums\OnboardingStep;
use App\Models\OnboardingProgress;
use App\Models\ScheduleSlot;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
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
    public static function build(User $user, Team $team): array
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
            'services' => [
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
                'locations' => self::toOptions($team->locations()->orderBy('name')->get(), 'name'),
                'specialists' => self::toOptions($team->members()->orderBy('name')->get(), 'name'),
                'countries' => LocationOptions::countries(),
                'priceTypes' => ServiceOptions::priceTypes(),
                'currencies' => ServiceOptions::currencies(),
                'serviceTypes' => ServiceOptions::serviceTypes(),
                'google' => [
                    'connected' => $user->hasGoogleConnected(),
                    'email' => $user->google_account_email,
                ],
            ],
            'profile' => [
                'name' => $user->profile?->name ?? $user->name,
                'email' => $user->profile?->email,
                'phone' => $user->profile?->phone,
                'job_title' => $user->profile?->job_title,
                'description' => $user->profile?->description,
            ],
            'schedule' => self::scheduleData($team),
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
     * Build the scheduling grid payload (members and existing slots) for the
     * work-hours step. Managers schedule the whole team, so every member is
     * returned as a grid row.
     *
     * @return array{members: array<int, array<string, mixed>>, slots: array<string, array<int, array{start: string, end: string}>>}
     */
    protected static function scheduleData(Team $team): array
    {
        $members = $team->members()->get();

        $slots = ScheduleSlot::query()
            ->where('team_id', $team->id)
            ->whereIn('user_id', $members->pluck('id'))
            ->orderBy('start_time')
            ->get();

        return [
            'members' => $members->map(fn (User $member): array => [
                'id' => $member->id,
                'name' => $member->name,
                'avatar' => $member->avatar ?? null,
                'role' => $member->pivot->role->value,
            ])->values()->all(),
            'slots' => $slots
                ->groupBy(fn (ScheduleSlot $slot): string => $slot->user_id.':'.$slot->date->format('Y-m-d'))
                ->map(fn (Collection $daySlots): array => $daySlots
                    ->map(fn (ScheduleSlot $slot): array => [
                        'start' => substr((string) $slot->start_time, 0, 5),
                        'end' => substr((string) $slot->end_time, 0, 5),
                    ])
                    ->values()
                    ->all())
                ->all(),
        ];
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
        ];
    }
}
