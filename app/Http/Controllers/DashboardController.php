<?php

namespace App\Http\Controllers;

use App\Concerns\InteractsWithAppointmentBooking;
use App\Enums\TeamRole;
use App\Models\ServiceCategory;
use App\Models\Team;
use App\Models\User;
use App\Support\Appointments\AppointmentOptions;
use App\Support\DashboardSummary;
use App\Support\LocationOptions;
use App\Support\OnboardingPayload;
use App\Support\ScheduleSummary;
use App\Support\ServiceOptions;
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
            return to_route('onboarding.show');
        }

        $summary = DashboardSummary::for($user, $team);

        return Inertia::render('dashboard', [
            'timezone' => $summary->timezone,
            'stats' => $summary->stats(),
            'weeklyTrend' => $summary->weeklyTrend(),
            'upcomingAppointments' => $summary->upcomingAppointments(),
            'formOptions' => $this->formOptions($team, $user),
            // Members swap the company hub for their own availability summary.
            'schedule' => $isTeamAdmin ? null : ScheduleSummary::forUser($user, $team),
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
