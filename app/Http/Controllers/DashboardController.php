<?php

namespace App\Http\Controllers;

use App\Concerns\InteractsWithAppointmentBooking;
use App\Enums\TeamRole;
use App\Models\Appointment;
use App\Models\ServiceCategory;
use App\Models\Team;
use App\Models\User;
use App\Support\Appointments\AppointmentOptions;
use App\Support\LocationOptions;
use App\Support\OnboardingPayload;
use App\Support\ServiceOptions;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use InteractsWithAppointmentBooking;

    /**
     * Show the dashboard, or send owners and admins to onboarding first.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $team = $user->currentTeam;
        $isTeamAdmin = $user->teamRole($team)?->isAtLeast(TeamRole::Admin) ?? false;

        // The dashboard is not much use before there is anything to show, so
        // whoever can set the team up is taken through onboarding instead.
        if ($isTeamAdmin && OnboardingPayload::progress($user, $team)->completed_at === null) {
            return to_route('onboarding.show', $team);
        }

        $timezone = $team->timezone ?: config('app.timezone');

        // Admins and owners see the whole team's bookings; members only see their own.
        $specialistId = $isTeamAdmin ? null : $user->id;

        return Inertia::render('dashboard', [
            'timezone' => $timezone,
            'stats' => $this->stats($team, $specialistId),
            'weeklyTrend' => $this->weeklyTrend($team, $timezone, $specialistId),
            'upcomingAppointments' => $this->upcomingAppointments($team, $timezone, $specialistId),
            'formOptions' => $this->formOptions($team, $user),
            'availableSlots' => Inertia::optional(fn (): array => $this->availableSlots($request, $team)),
        ]);
    }

    /**
     * Build the option data that powers the dashboard's quick-create drawers
     * (appointment, customer, service and location) without leaving the page.
     *
     * @return array<string, mixed>
     */
    protected function formOptions(Team $team, User $user): array
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
                'services' => $serviceOptions,
                'locations' => $locationOptions,
                'specialists' => $specialistOptions,
                'countries' => LocationOptions::countries(),
                'priceTypes' => ServiceOptions::priceTypes(),
                'currencies' => ServiceOptions::currencies(),
                'serviceTypes' => ServiceOptions::serviceTypes(),
                'deliveryTypes' => ServiceOptions::deliveryTypes(),
                'meetingProviders' => ServiceOptions::meetingProviders(),
                'google' => [
                    'connected' => $user->hasGoogleConnected(),
                    'email' => $user->google_account_email,
                ],
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
            ->booked()
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
            ->booked()
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
            ->booked()
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
}
