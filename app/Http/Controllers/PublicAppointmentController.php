<?php

namespace App\Http\Controllers;

use App\Concerns\InteractsWithAppointmentBooking;
use App\Http\Requests\Appointments\BookPublicAppointmentRequest;
use App\Models\Team;
use App\Support\Appointments\AppointmentOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
}
