<?php

namespace App\Http\Controllers;

use App\Concerns\InteractsWithAppointmentBooking;
use App\Enums\AppointmentAlert;
use App\Enums\TeamType;
use App\Http\Requests\Appointments\BookPublicAppointmentRequest;
use App\Models\Appointment;
use App\Models\Team;
use App\Support\Appointments\AppointmentOptions;
use App\Support\BrandPalette;
use App\Support\Localization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class PublicAppointmentController extends Controller
{
    use InteractsWithAppointmentBooking;

    /**
     * Show the public booking page for a company.
     */
    public function show(Request $request, Team $company): Response|RedirectResponse
    {
        // The platform's own team is not publicly bookable.
        if ($company->slug === 'uponco') {
            return redirect()->route('home');
        }

        return $this->renderPage($request, $company, null);
    }

    /**
     * Show the booking page with a service already chosen.
     */
    public function showService(Request $request, Team $company, string $service): Response|RedirectResponse
    {
        return $this->renderPreset($request, $company, function (Team $company) use ($service): ?array {
            $model = $company->services()
                ->where('services.is_active', true)
                ->where('services.slug', $service)
                ->first();

            return $model === null ? null : ['type' => 'service', 'id' => $model->id, 'name' => $model->title];
        });
    }

    /**
     * Show the booking page with a specialist already chosen.
     */
    public function showSpecialist(Request $request, Team $company, string $specialist): Response|RedirectResponse
    {
        return $this->renderPreset($request, $company, function (Team $company) use ($specialist): ?array {
            $id = array_search($specialist, AppointmentOptions::specialistSlugs($company), strict: true);

            if ($id === false) {
                return null;
            }

            $member = $company->members()->whereKey($id)->first();

            return $member === null ? null : ['type' => 'specialist', 'id' => $member->id, 'name' => $member->name];
        });
    }

    /**
     * Show the booking page with a location already chosen.
     */
    public function showLocation(Request $request, Team $company, string $location): Response|RedirectResponse
    {
        return $this->renderPreset($request, $company, function (Team $company) use ($location): ?array {
            $model = $company->locations()
                ->where('is_active', true)
                ->where('slug', $location)
                ->first();

            return $model === null ? null : ['type' => 'location', 'id' => $model->id, 'name' => $model->name];
        });
    }

    /**
     * Render a deep-linked page, 404ing when the slug matches nothing bookable.
     *
     * @param  callable(Team): ?array{type: string, id: int, name: string}  $resolve
     */
    protected function renderPreset(Request $request, Team $company, callable $resolve): Response|RedirectResponse
    {
        if ($company->slug === 'uponco') {
            return redirect()->route('home');
        }

        $preset = $resolve($company);

        abort_if($preset === null, 404);

        return $this->renderPage($request, $company, $preset);
    }

    /**
     * Render the booking page, optionally with one choice already pinned by a
     * deep link.
     *
     * @param  ?array{type: string, id: int, name: string}  $preset
     */
    protected function renderPage(Request $request, Team $company, ?array $preset): Response
    {
        $timezone = $company->timezone ?: config('app.timezone');

        // A signed-in member viewing their own booking page gets a shortcut back
        // to the dashboard; visitors never see it.
        $user = $request->user();
        $canManage = $user !== null
            && $company->members()->whereKey($user->getKey())->exists();

        // The public page follows the team's language settings, not the global
        // config: the team's default wins on first visit, and a visitor's saved
        // choice only carries over when the team still offers that language.
        $available = $company->availableLocales();
        $cookie = $request->cookie('locale');
        $locale = is_string($cookie) && in_array($cookie, $available, true)
            ? $cookie
            : $company->defaultLocale();

        App::setLocale($locale);

        return Inertia::render('public/appointments/book', [
            'locale' => $locale,
            'availableLocales' => Localization::optionsFor($available),
            'company' => $this->companyHeaderPayload($company),
            'canManage' => $canManage,
            'timezone' => $timezone,
            'services' => AppointmentOptions::services($company),
            'locations' => AppointmentOptions::detailedLocations($company),
            'specialists' => AppointmentOptions::specialists($company),
            'preset' => $preset === null
                ? null
                : $preset + ['back_url' => route('public.appointments.show', $company)],
            'slotWindow' => Inertia::optional(fn (): array => $this->availableSlotsWindow($request, $company)),
        ]);
    }

    /**
     * The company payload the booking page's header is built from.
     *
     * A solo practitioner's booking page leads with their own name and job
     * title rather than the business name and a generic "Book an appointment",
     * which is otherwise the same line on every page. Organisations, and
     * individuals whose profile has no job title, keep the generic wording —
     * the page falls back whenever `tagline` is null.
     *
     * @return array<string, mixed>
     */
    protected function companyHeaderPayload(Team $company): array
    {
        $isIndividual = $company->type === TeamType::Individual;
        $owner = $isIndividual ? $company->owner() : null;

        return [
            'name' => $company->name,
            'slug' => $company->slug,
            'logo' => $company->logoUrl(),
            'category' => $company->business_category?->value,
            'type' => $company->type?->value,
            'headline' => $owner?->name ?: $company->name,
            'tagline' => $owner?->profile?->job_title,
            'brand' => BrandPalette::forTeam($company),
        ];
    }

    /**
     * Store a booking submitted from the public page.
     */
    public function store(BookPublicAppointmentRequest $request, Team $company): RedirectResponse
    {
        $this->createAppointment($company, $request);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Your appointment has been booked.')]);

        // Redirect to the booking page explicitly rather than back(): embedded in
        // the widget iframe, iOS Safari strips the Referer to the bare origin, so
        // back() would resolve to "/" and swap the iframe to the home page instead
        // of letting the success screen render on the booking component.
        return redirect()->route('public.appointments.show', $company);
    }

    /**
     * Show the public cancellation page reached from the signed link in the
     * booking confirmation email.
     *
     * The page always renders the booking details so the customer can be sure
     * of what they are cancelling; the flags tell the page whether cancelling is
     * still possible (not in the past and not already cancelled).
     */
    public function showCancel(Appointment $appointment): Response
    {
        return Inertia::render('public/appointments/cancel', [
            'company' => $this->companyPayload($appointment),
            'appointment' => $this->cancellationPayload($appointment),
            'isPast' => $appointment->isPast(),
            'alreadyCancelled' => $appointment->isCancelled(),
            'canCancel' => ! $appointment->isPast() && ! $appointment->isCancelled(),
        ]);
    }

    /**
     * Cancel the appointment from the signed link.
     *
     * A past or already-cancelled appointment can never be cancelled here, even
     * with a valid signature, so the guard mirrors the flags shown on the page.
     * Afterwards the customer is redirected back to the (freshly signed) page,
     * which then renders the cancelled state.
     */
    public function cancel(Appointment $appointment): RedirectResponse
    {
        if ($appointment->isPast() || $appointment->isCancelled()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('This appointment can no longer be cancelled.')]);

            return $this->redirectToCancelPage($appointment);
        }

        $appointment->cancel();
        $this->notifyCustomerCancelled($appointment);
        $this->notifyAppointmentAudience($appointment, AppointmentAlert::Cancelled);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Your appointment has been cancelled.')]);

        return $this->redirectToCancelPage($appointment);
    }

    /**
     * Build the company payload shared by the booking and cancellation pages.
     *
     * @return array{name: string, slug: string, logo: ?string}
     */
    protected function companyPayload(Appointment $appointment): array
    {
        $team = $appointment->team;

        return [
            'name' => $team->name,
            'slug' => $team->slug,
            'logo' => $team->logoUrl(),
            'category' => $team->business_category?->value,
            'brand' => BrandPalette::forTeam($team),
        ];
    }

    /**
     * Build the booking details shown on the cancellation page.
     *
     * @return array<string, mixed>
     */
    protected function cancellationPayload(Appointment $appointment): array
    {
        $team = $appointment->team;
        $timezone = $team->timezone ?: config('app.timezone');

        return $this->toAppointmentArray($appointment, $timezone);
    }

    /**
     * Redirect back to the signed cancellation page for the appointment.
     */
    protected function redirectToCancelPage(Appointment $appointment): RedirectResponse
    {
        return redirect()->to(
            URL::signedRoute('public.appointments.cancel', ['appointment' => $appointment->id]),
        );
    }
}
