<?php

namespace App\Http\Requests\Appointments;

use App\Enums\DeliveryType;
use App\Models\Appointment;
use App\Models\Location;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use App\Support\Appointments\SlotGenerator;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveAppointmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $appointment = $this->route('appointment');

        if (! $appointment instanceof Appointment) {
            return true;
        }

        return $appointment->team_id === $this->team()->id;
    }

    /**
     * Get the team the appointment belongs to.
     */
    protected function team(): Team
    {
        return $this->user()->currentTeam;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $teamId = $this->team()->id;

        return [
            'service_id' => [
                'required',
                Rule::exists('services', 'id')->where(fn ($query) => $query->where('team_id', $teamId)),
            ],
            'location_id' => [
                'nullable',
                Rule::exists('locations', 'id')->where(fn ($query) => $query->where('team_id', $teamId)),
            ],
            'specialist_id' => [
                'required',
                Rule::exists('team_members', 'user_id')->where(fn ($query) => $query->where('team_id', $teamId)),
            ],
            'start_at' => ['required', 'date'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['nullable', 'required_without:customer_phone', 'email', 'max:255'],
            'customer_phone' => ['nullable', 'required_without:customer_email', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * Get the custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'customer_email.required_without' => __('Enter an email or a phone number for the customer.'),
            'customer_phone.required_without' => __('Enter a phone number or an email for the customer.'),
        ];
    }

    /**
     * Configure the validator instance with availability checks.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $service = $this->service();
            $specialist = $this->specialist();

            if (! $service->specialists()->whereKey($specialist->id)->exists()) {
                $validator->errors()->add('specialist_id', __('The selected specialist does not provide this service.'));

                return;
            }

            if ($service->delivery_type === DeliveryType::Onsite) {
                $location = $this->location();

                if (! $location instanceof Location) {
                    $validator->errors()->add('location_id', __('Select a location for this service.'));

                    return;
                }

                if (! $service->locations()->whereKey($location->id)->exists()) {
                    $validator->errors()->add('location_id', __('This service is not offered at the selected location.'));

                    return;
                }

                if (! $location->specialists()->whereKey($specialist->id)->exists()) {
                    $validator->errors()->add('specialist_id', __('The selected specialist does not work at this location.'));

                    return;
                }
            }

            $available = SlotGenerator::isAvailableStart(
                $service,
                $specialist,
                $this->team()->id,
                $this->teamTimezone(),
                $this->startAt(),
                $this->route('appointment')?->id,
            );

            if (! $available) {
                $validator->errors()->add('start_at', __('The selected time slot is no longer available.'));
            }
        });
    }

    /**
     * Get the selected service.
     */
    public function service(): Service
    {
        return Service::findOrFail($this->integer('service_id'));
    }

    /**
     * Get the selected location, if one was provided.
     */
    public function location(): ?Location
    {
        if (! $this->filled('location_id')) {
            return null;
        }

        return Location::find($this->integer('location_id'));
    }

    /**
     * Get the timezone used to interpret work hours and slots.
     */
    public function teamTimezone(): string
    {
        return $this->team()->timezone ?: config('app.timezone');
    }

    /**
     * Get the selected specialist.
     */
    public function specialist(): User
    {
        return User::findOrFail($this->integer('specialist_id'));
    }

    /**
     * Get the appointment start as a UTC instant.
     */
    public function startAt(): CarbonImmutable
    {
        return CarbonImmutable::parse($this->validated('start_at'))->utc();
    }

    /**
     * Build the appointment attributes for the selected service and slot.
     *
     * @return array<string, mixed>
     */
    public function appointmentData(): array
    {
        $service = $this->service();
        $startAt = $this->startAt();

        return [
            'service_id' => $service->id,
            'location_id' => $this->location()?->id,
            'specialist_id' => $this->integer('specialist_id'),
            'start_at' => $startAt,
            'end_at' => $startAt->addMinutes($service->duration),
            'delivery_type' => $service->delivery_type->value,
            'online_meeting_provider' => $service->online_meeting_provider,
            'notes' => $this->validated('notes'),
        ];
    }

    /**
     * Get the submitted customer details.
     *
     * @return array{name: string, email: ?string, phone: ?string}
     */
    public function customerData(): array
    {
        return [
            'name' => $this->validated('customer_name'),
            'email' => $this->validated('customer_email'),
            'phone' => $this->validated('customer_phone'),
        ];
    }
}
