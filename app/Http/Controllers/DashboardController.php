<?php

namespace App\Http\Controllers;

use App\Concerns\InteractsWithAppointmentBooking;
use App\Enums\OnboardingStep;
use App\Enums\TeamRole;
use App\Models\Appointment;
use App\Models\Location;
use App\Models\OnboardingProgress;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Team;
use App\Models\User;
use App\Support\Appointments\AppointmentOptions;
use App\Support\LocationOptions;
use App\Support\ServiceOptions;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use InteractsWithAppointmentBooking;

    /**
     * Show the dashboard, including the onboarding wizard for owners and admins.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $user->currentTeam;
        $onboarding = $this->onboarding($user, $team);
        $timezone = $team->timezone ?: config('app.timezone');

        // Admins and owners see the whole team's bookings; members only see their own.
        $specialistId = $user->teamRole($team)?->isAtLeast(TeamRole::Admin) ? null : $user->id;

        return Inertia::render('dashboard', [
            'onboarding' => $onboarding,
            'timezone' => $timezone,
            'stats' => $onboarding === null ? $this->stats($team, $specialistId) : null,
            'weeklyTrend' => $onboarding === null ? $this->weeklyTrend($team, $timezone, $specialistId) : null,
            'upcomingAppointments' => $onboarding === null
                ? $this->upcomingAppointments($team, $timezone, $specialistId)
                : null,
            'formOptions' => $onboarding === null ? $this->formOptions($team) : null,
            'availableSlots' => Inertia::optional(fn (): array => $this->availableSlots($request, $team)),
        ]);
    }

    /**
     * Build the option data that powers the dashboard's quick-create drawers
     * (appointment, customer, service and location) without leaving the page.
     *
     * @return array<string, mixed>
     */
    protected function formOptions(Team $team): array
    {
        $serviceOptions = $this->toOptions($team->services()->orderBy('title')->get(), 'title');
        $locationOptions = $this->toOptions($team->locations()->orderBy('name')->get(), 'name');
        $specialistOptions = $this->toOptions($team->members()->orderBy('name')->get(), 'name');

        return [
            'appointments' => [
                'services' => AppointmentOptions::services($team),
                'locations' => AppointmentOptions::locations($team),
                'specialists' => AppointmentOptions::specialists($team),
            ],
            'services' => [
                'categories' => $team->serviceCategories()->orderBy('name')->get()->map(fn (ServiceCategory $category): array => [
                    'id' => $category->id,
                    'name' => $category->name,
                ]),
                'locations' => $locationOptions,
                'specialists' => $specialistOptions,
                'priceTypes' => ServiceOptions::priceTypes(),
                'serviceTypes' => ServiceOptions::serviceTypes(),
                'deliveryTypes' => ServiceOptions::deliveryTypes(),
                'meetingProviders' => ServiceOptions::meetingProviders(),
            ],
            'locations' => [
                'services' => $serviceOptions,
                'specialists' => $specialistOptions,
                'countries' => LocationOptions::countries(),
            ],
        ];
    }

    /**
     * Build the headline metrics shown across the dashboard.
     *
     * When $specialistId is provided the booking counts are limited to that
     * specialist so members only see their own totals.
     *
     * @return array{customers: int, totalBookings: int, upcoming: int, services: int, locations: int}
     */
    protected function stats(Team $team, ?int $specialistId = null): array
    {
        $bookings = fn () => $team->appointments()
            ->when($specialistId, fn ($query) => $query->where('specialist_id', $specialistId));

        return [
            'customers' => $team->customers()->count(),
            'totalBookings' => $bookings()->count(),
            'upcoming' => $bookings()->where('start_at', '>=', now())->count(),
            'services' => $team->services()->count(),
            'locations' => $team->locations()->count(),
        ];
    }

    /**
     * Build a 7-day booking trend (today plus the next six days) for the chart.
     *
     * When $specialistId is provided the trend is limited to that specialist so
     * members only see their own bookings.
     *
     * @return array<int, array{label: string, date: string, count: int, isToday: bool}>
     */
    protected function weeklyTrend(Team $team, string $timezone, ?int $specialistId = null): array
    {
        $start = CarbonImmutable::now($timezone)->startOfDay();
        $end = $start->addDays(7);
        $today = $start->toDateString();

        $counts = $team->appointments()
            ->when($specialistId, fn ($query) => $query->where('specialist_id', $specialistId))
            ->whereBetween('start_at', [$start->utc(), $end->utc()])
            ->get(['start_at'])
            ->groupBy(fn (Appointment $appointment): string => $appointment->start_at
                ->setTimezone($timezone)
                ->toDateString())
            ->map->count();

        return collect(range(0, 6))
            ->map(function (int $offset) use ($start, $counts, $today): array {
                $day = $start->addDays($offset);
                $date = $day->toDateString();

                return [
                    'label' => $day->format('D'),
                    'date' => $date,
                    'count' => (int) $counts->get($date, 0),
                    'isToday' => $date === $today,
                ];
            })
            ->all();
    }

    /**
     * Fetch the next handful of upcoming appointments for the sidebar list.
     *
     * When $specialistId is provided the list is limited to that specialist so
     * members only see their own upcoming appointments.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function upcomingAppointments(Team $team, string $timezone, ?int $specialistId = null): array
    {
        return $team->appointments()
            ->with(['service:id,title', 'location:id,name', 'specialist:id,name', 'customer:id,name,email,phone'])
            ->when($specialistId, fn ($query) => $query->where('specialist_id', $specialistId))
            ->where('start_at', '>=', now())
            ->orderBy('start_at')
            ->limit(6)
            ->get()
            ->map(fn (Appointment $appointment): array => $this->toAppointmentArray($appointment, $timezone))
            ->all();
    }

    /**
     * Build the onboarding payload, or null when it should not be shown.
     *
     * @return array<string, mixed>|null
     */
    protected function onboarding(User $user, Team $team): ?array
    {
        $role = $user->teamRole($team);

        if ($role === null || ! $role->isAtLeast(TeamRole::Admin)) {
            return null;
        }

        $progress = OnboardingProgress::firstOrCreate([
            'team_id' => $team->id,
            'user_id' => $user->id,
        ]);

        $progress->syncFromData($team, $user);
        $progress->refreshCompletion();

        if ($progress->isDirty()) {
            $progress->save();
        }

        if ($progress->completed_at !== null) {
            return null;
        }

        return [
            'currentStep' => $progress->current_step->value,
            'steps' => collect(OnboardingStep::cases())->map(fn (OnboardingStep $step): array => [
                'key' => $step->value,
                'label' => $step->label(),
                'status' => $progress->statusFor($step)->value,
                'mandatory' => $step->isMandatory(),
            ])->all(),
            'locations' => [
                'locations' => $team->locations()
                    ->with(['services:id', 'specialists:id'])
                    ->orderBy('name')
                    ->get()
                    ->map(fn (Location $location): array => $this->toLocationArray($location)),
                'services' => $this->toOptions($team->services()->orderBy('title')->get(), 'title'),
                'specialists' => $this->toOptions($team->members()->orderBy('name')->get(), 'name'),
                'countries' => LocationOptions::countries(),
            ],
            'services' => [
                'categories' => $team->serviceCategories()->orderBy('name')->get()->map(fn (ServiceCategory $category): array => [
                    'id' => $category->id,
                    'name' => $category->name,
                ]),
                'services' => $team->services()
                    ->with(['locations:id', 'specialists:id'])
                    ->orderBy('title')
                    ->get()
                    ->map(fn (Service $service): array => $this->toServiceArray($service)),
                'locations' => $this->toOptions($team->locations()->orderBy('name')->get(), 'name'),
                'specialists' => $this->toOptions($team->members()->orderBy('name')->get(), 'name'),
                'priceTypes' => ServiceOptions::priceTypes(),
                'serviceTypes' => ServiceOptions::serviceTypes(),
                'deliveryTypes' => ServiceOptions::deliveryTypes(),
                'meetingProviders' => ServiceOptions::meetingProviders(),
            ],
            'profile' => [
                'name' => $user->profile?->name ?? $user->name,
                'email' => $user->profile?->email,
                'phone' => $user->profile?->phone,
                'job_title' => $user->profile?->job_title,
                'description' => $user->profile?->description,
            ],
        ];
    }

    /**
     * Map a collection of models into value/label select options.
     *
     * @param  Collection<int, Model>  $models
     * @return Collection<int, array{value: string, label: string}>
     */
    protected function toOptions($models, string $labelKey)
    {
        return $models->map(fn ($model): array => [
            'value' => (string) $model->id,
            'label' => $model->{$labelKey},
        ]);
    }

    /**
     * Transform a location into its form representation.
     *
     * @return array<string, mixed>
     */
    protected function toLocationArray(Location $location): array
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
            'service_ids' => $location->services->pluck('id')->all(),
            'user_ids' => $location->specialists->pluck('id')->all(),
        ];
    }

    /**
     * Transform a service into its form representation.
     *
     * @return array<string, mixed>
     */
    protected function toServiceArray(Service $service): array
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
