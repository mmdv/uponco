<?php

namespace App\Concerns;

use App\Enums\AppointmentChange;
use App\Http\Requests\Appointments\SaveAppointmentRequest;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use App\Notifications\Appointments\AppointmentBooked;
use App\Support\Appointments\SlotGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

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
        $customer = $this->resolveCustomer($team, $request->customerData());

        $appointment = $team->appointments()->create([
            ...$request->appointmentData(),
            'customer_id' => $customer->id,
        ]);

        $appointment->setRelation('customer', $customer);
        $this->notifyCustomer($appointment, AppointmentChange::Created);

        return $appointment;
    }

    /**
     * Apply the request changes to an existing appointment and notify the customer.
     */
    protected function updateAppointment(Team $team, SaveAppointmentRequest $request, Appointment $appointment): Appointment
    {
        $customer = $this->resolveCustomer($team, $request->customerData());

        $appointment->update([
            ...$request->appointmentData(),
            'customer_id' => $customer->id,
        ]);

        $appointment->setRelation('customer', $customer);
        $this->notifyCustomer($appointment, AppointmentChange::Updated);

        return $appointment;
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
     * @return array<int, array{start: string, end: string, label: string, available: bool}>
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
