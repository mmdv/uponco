<?php

namespace App\Concerns;

use App\Enums\AppointmentAlert;
use App\Enums\AppointmentChange;
use App\Enums\DeliveryType;
use App\Http\Requests\Appointments\SaveAppointmentRequest;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use App\Notifications\Appointments\AppointmentBooked;
use App\Notifications\Appointments\AppointmentCancelled;
use App\Notifications\Appointments\SpecialistAppointmentAlert;
use App\Support\Appointments\SlotGenerator;
use App\Support\Google\GoogleCalendarService;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;

/**
 * Shared booking helpers used by both the dashboard and public booking flows.
 */
trait InteractsWithAppointmentBooking
{
    /**
     * Create the appointment for the request and notify the customer by email.
     */
    protected function createAppointment(Team $team, SaveAppointmentRequest $request): Appointment
    {
        $appointment = DB::transaction(function () use ($team, $request): Appointment {
            $customer = $this->resolveCustomer($team, $request->customerData());
            $data = $request->appointmentData();

            $this->guardSlotAvailability($request->service(), $data['start_at'], $data['end_at'], $data['specialist_id'], $customer->id);

            $appointment = $team->appointments()->create([
                ...$data,
                'customer_id' => $customer->id,
            ]);

            $appointment->setRelation('customer', $customer);

            return $appointment;
        });

        $this->maybeGenerateMeetingLink($appointment);
        $this->notifyCustomer($appointment, AppointmentChange::Created);
        $this->notifySpecialist($appointment, AppointmentAlert::Booked);

        return $appointment;
    }

    /**
     * Create a Google Meet link for an online appointment when the assigned
     * specialist has connected their Google account.
     *
     * This makes a live Google Calendar API call, so it runs outside the booking
     * transaction and never blocks the booking: any failure is reported and the
     * appointment simply keeps a null meeting URL.
     */
    protected function maybeGenerateMeetingLink(Appointment $appointment): void
    {
        if ($appointment->delivery_type !== DeliveryType::Online) {
            return;
        }

        if ($appointment->online_meeting_provider !== 'google_meet') {
            return;
        }

        if (filled($appointment->meeting_url)) {
            return;
        }

        $specialist = $appointment->specialist;

        if (! $specialist instanceof User || ! $specialist->hasGoogleConnected()) {
            return;
        }

        try {
            $meeting = (new GoogleCalendarService)->createMeetEvent($specialist, $appointment);

            if ($meeting !== null) {
                $appointment->update([
                    'meeting_url' => $meeting['meet_url'],
                    'google_calendar_event_id' => $meeting['event_id'],
                ]);
            }
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Guard the slot before the row is created: an individual slot must still be
     * free, a group session must still have a free seat and may not already
     * contain the customer.
     *
     * The request validation already rejects an unavailable slot, but two
     * concurrent bookings could each see it as free. Re-check under a row lock
     * inside the surrounding transaction so an individual slot can never be
     * double-booked, capacity can never be exceeded, and a customer can never
     * end up booked into the same session twice.
     */
    protected function guardSlotAvailability(Service $service, CarbonInterface $startAt, CarbonInterface $endAt, int $specialistId, int $customerId): void
    {
        if (! $service->isGroup()) {
            $taken = Appointment::query()
                ->booked()
                ->where('specialist_id', $specialistId)
                ->where('start_at', '<', $endAt)
                ->where('end_at', '>', $startAt)
                ->lockForUpdate()
                ->exists();

            if ($taken) {
                throw ValidationException::withMessages([
                    'start_at' => __('The selected time slot is no longer available.'),
                ]);
            }

            return;
        }

        $session = Appointment::query()
            ->booked()
            ->where('service_id', $service->id)
            ->where('specialist_id', $specialistId)
            ->where('start_at', $startAt)
            ->lockForUpdate()
            ->get(['customer_id']);

        if ($session->contains('customer_id', $customerId)) {
            throw ValidationException::withMessages([
                'booking_conflict' => __('You have already booked this session. Use a different email or phone number, or choose another time.'),
            ]);
        }

        if ($session->count() >= $service->capacity) {
            throw ValidationException::withMessages([
                'start_at' => __('This session is now fully booked.'),
            ]);
        }
    }

    /**
     * Apply the request changes to an existing appointment and notify the customer.
     */
    protected function updateAppointment(Team $team, SaveAppointmentRequest $request, Appointment $appointment): Appointment
    {
        $customer = $this->resolveCustomer($team, $request->customerData());

        $previousSpecialistId = $appointment->specialist_id;
        $previousStart = $appointment->start_at;

        $appointment->update([
            ...$request->appointmentData(),
            'customer_id' => $customer->id,
        ]);

        $appointment->setRelation('customer', $customer);
        $this->maybeGenerateMeetingLink($appointment);
        $this->notifyCustomer($appointment, AppointmentChange::Updated);
        $this->notifySpecialistsOfEdit($appointment, $previousSpecialistId, $previousStart);

        return $appointment;
    }

    /**
     * Alert the affected specialists after an appointment was edited.
     *
     * Handing the appointment to a different specialist frees the original one's
     * slot and fills the new one's, so both are told. Otherwise only a change of
     * start time is worth a push — editing notes or a location does not affect
     * when the specialist has to show up.
     */
    protected function notifySpecialistsOfEdit(Appointment $appointment, int $previousSpecialistId, CarbonInterface $previousStart): void
    {
        if ($appointment->specialist_id !== $previousSpecialistId) {
            $previousSpecialist = User::find($previousSpecialistId);

            if ($previousSpecialist instanceof User) {
                $this->notifySpecialist($appointment, AppointmentAlert::Cancelled, $previousSpecialist, $previousStart);
            }

            $this->notifySpecialist($appointment, AppointmentAlert::Booked);

            return;
        }

        if (! $appointment->start_at->equalTo($previousStart)) {
            $this->notifySpecialist($appointment, AppointmentAlert::Rescheduled);
        }
    }

    /**
     * Email the customer confirming that their appointment was created or updated.
     *
     * The email is only sent when the customer supplied an address; phone-only
     * customers simply don't receive one.
     */
    protected function notifyCustomer(Appointment $appointment, AppointmentChange $change): void
    {
        $customer = $appointment->customer;

        if (! $customer?->email) {
            return;
        }

        try {
            Notification::route('mail', $customer->email)
                ->notify(new AppointmentBooked($appointment, $change));
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Email the customer confirming that their appointment was cancelled.
     *
     * As with the booking confirmation, the email is only sent when the customer
     * supplied an address.
     */
    protected function notifyCustomerCancelled(Appointment $appointment): void
    {
        $customer = $appointment->customer;

        if (! $customer?->email) {
            return;
        }

        try {
            Notification::route('mail', $customer->email)
                ->notify(new AppointmentCancelled($appointment));
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Push a notification to the specialist the appointment is assigned to.
     *
     * Skipped when the specialist is the signed-in user making the change —
     * there is no point buzzing someone's phone about something they are doing
     * on screen right now. The public booking flow is unauthenticated, so a
     * customer booking always reaches the specialist.
     *
     * As with the customer emails, a delivery failure is reported and swallowed
     * so it can never break the booking.
     */
    protected function notifySpecialist(Appointment $appointment, AppointmentAlert $alert, ?User $specialist = null, ?CarbonInterface $startAt = null): void
    {
        $specialist ??= $appointment->specialist;

        if (! $specialist instanceof User) {
            return;
        }

        if (Auth::id() === $specialist->id) {
            return;
        }

        try {
            $specialist->notify(new SpecialistAppointmentAlert($appointment, $alert, $startAt));
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Find or create the customer for the appointment within the team.
     *
     * @param  array{name: string, email: ?string, phone: ?string}  $data
     */
    protected function resolveCustomer(Team $team, array $data): Customer
    {
        $existing = $team->customers()
            ->where(function ($query) use ($data): void {
                $query->when($data['email'], fn ($q) => $q->orWhere('email', $data['email']));
                $query->when($data['phone'], fn ($q) => $q->orWhere('phone', $data['phone']));
            })
            ->first();

        if ($existing) {
            return $existing;
        }

        return $team->customers()->create($data);
    }

    /**
     * Transform an appointment into its array representation.
     *
     * @return array<string, mixed>
     */
    protected function toAppointmentArray(Appointment $appointment, string $timezone): array
    {
        return [
            'id' => $appointment->id,
            'start_at' => $appointment->start_at->toIso8601String(),
            'end_at' => $appointment->end_at->toIso8601String(),
            'timezone' => $timezone,
            'notes' => $appointment->notes,
            'service' => [
                'id' => $appointment->service?->id ?? $appointment->service_id,
                'title' => $appointment->service?->title ?? __('Deleted service'),
            ],
            'location' => $appointment->location ? [
                'id' => $appointment->location->id,
                'name' => $appointment->location->name,
            ] : null,
            'specialist' => [
                'id' => $appointment->specialist?->id ?? $appointment->specialist_id,
                'name' => $appointment->specialist?->name ?? __('Unknown specialist'),
            ],
            'customer' => [
                'id' => $appointment->customer?->id ?? $appointment->customer_id,
                'name' => $appointment->customer?->name ?? __('Deleted customer'),
                'email' => $appointment->customer?->email,
                'phone' => $appointment->customer?->phone,
            ],
            'service_id' => $appointment->service_id,
            'location_id' => $appointment->location_id,
            'specialist_id' => $appointment->specialist_id,
        ];
    }

    /**
     * Resolve the available slots for the current picker selection.
     *
     * @return array<int, array{start: string, end: string, label: string, available: bool, remaining: ?int}>
     */
    protected function availableSlots(Request $request, Team $team): array
    {
        $data = $request->validate([
            'service_id' => ['required', 'integer'],
            'specialist_id' => ['required', 'integer'],
            'date' => ['required', 'date_format:Y-m-d'],
            'appointment_id' => ['nullable', 'integer'],
        ]);

        $service = $team->services()->whereKey($data['service_id'])->first();
        $specialist = $team->members()->whereKey($data['specialist_id'])->first();

        if (! $service instanceof Service || ! $specialist instanceof User) {
            return [];
        }

        return SlotGenerator::generate(
            $service,
            $specialist,
            $team->id,
            $team->timezone ?: config('app.timezone'),
            $data['date'],
            $data['appointment_id'] ?? null,
        );
    }
}
