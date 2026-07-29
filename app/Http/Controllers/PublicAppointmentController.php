<?php

namespace App\Http\Controllers;

use App\Concerns\InteractsWithAppointmentBooking;
use App\Http\Requests\Appointments\BookPublicAppointmentRequest;
use App\Models\Appointment;
use App\Models\Team;
use App\Support\Appointments\AppointmentOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        $timezone = $company->timezone ?: config('app.timezone');

        return Inertia::render('public/appointments/book', [
            'company' => [
                'name' => $company->name,
                'slug' => $company->slug,
                'logo' => $company->logoUrl(),
            ],
            'timezone' => $timezone,
            'services' => AppointmentOptions::services($company),
            'locations' => AppointmentOptions::locations($company),
            'specialists' => AppointmentOptions::specialists($company),
            'availableSlots' => Inertia::optional(fn (): array => $this->availableSlots($request, $company)),
        ]);
    }

    /**
     * Store a booking submitted from the public page.
     */
    public function store(BookPublicAppointmentRequest $request, Team $company): RedirectResponse
    {
        $this->createAppointment($company, $request);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Your appointment has been booked.')]);

        return back();
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
