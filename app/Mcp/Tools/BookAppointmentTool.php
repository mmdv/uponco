<?php

namespace App\Mcp\Tools;

use App\Concerns\InteractsWithAppointmentBooking;
use App\Enums\AppointmentSource;
use App\Enums\DeliveryType;
use App\Http\Requests\Appointments\SaveAppointmentRequest;
use App\Mcp\AppointmentData;
use App\Mcp\FormRequestBridge;
use App\Models\Customer;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;

#[Name('book-appointment')]
#[Title('Book appointment')]
#[Description('Book an appointment, exactly as the Uponco calendar does: the time must be a free slot (check find-available-slots first) and the customer is emailed a confirmation when they have an email address. Confirm the service, specialist, day, time and customer with the user before calling. Use customer_id for an existing customer, or name plus email and/or phone for a new one.')]
class BookAppointmentTool extends BusinessTool
{
    use InteractsWithAppointmentBooking;

    /**
     * @return array<string, mixed>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'service_id' => $schema->integer()->description('The service id from get-business-overview.')->required(),
            'date' => $schema->string()->format('date')->description('Day, YYYY-MM-DD (business timezone).')->required(),
            'time' => $schema->string()->pattern('^\d{2}:\d{2}$')->description('Start time, HH:MM 24-hour (business timezone), one of the times find-available-slots returned.')->required(),
            'specialist_id' => $schema->integer()->description('Who does the appointment. Defaults to the connected user.'),
            'location_id' => $schema->integer()->description('Where, for in-person services. May be left out when the specialist offers the service at one location only.'),
            'customer_id' => $schema->integer()->description('An existing customer, from search-customers.'),
            'customer_name' => $schema->string()->description('A new customer\'s name.'),
            'customer_email' => $schema->string()->format('email')->description('A new customer\'s email; they get the confirmation here.'),
            'customer_phone' => $schema->string()->description('A new customer\'s phone number.'),
            'notes' => $schema->string()->description('Internal note on the appointment.'),
        ];
    }

    protected function handleForBusiness(Request $request, User $user, Team $team): Response|ResponseFactory
    {
        $data = $request->validate([
            'service_id' => ['required', 'integer'],
            'date' => ['required', 'date_format:Y-m-d'],
            'time' => ['required', 'date_format:H:i'],
            'specialist_id' => ['nullable', 'integer'],
            'location_id' => ['nullable', 'integer'],
            'customer_id' => ['nullable', 'integer'],
            'customer_name' => ['nullable', 'string'],
            'customer_email' => ['nullable', 'string'],
            'customer_phone' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $contact = [
            'customer_name' => $data['customer_name'] ?? null,
            'customer_email' => $data['customer_email'] ?? null,
            'customer_phone' => $data['customer_phone'] ?? null,
        ];

        if (isset($data['customer_id'])) {
            $customer = $team->customers()->find($data['customer_id']);

            if (! $customer instanceof Customer) {
                return Response::error(__('Customer not found. Use search-customers to find them.'));
            }

            // Booking matches an existing customer by email or phone.
            $contact = ['customer_name' => $customer->name, 'customer_email' => $customer->email, 'customer_phone' => $customer->phone];
        }

        $specialistId = (int) ($data['specialist_id'] ?? $user->id);

        $form = FormRequestBridge::validate(SaveAppointmentRequest::class, $user, [
            'service_id' => $data['service_id'],
            'specialist_id' => $specialistId,
            'location_id' => $data['location_id'] ?? $this->onlyLocation($team, (int) $data['service_id'], $specialistId),
            'start_at' => $this->businessTime($team, $data['date'], $data['time'])->toIso8601String(),
            ...$contact,
            'notes' => $data['notes'] ?? null,
        ]);

        $appointment = $this->createAppointment($team, $form, AppointmentSource::Assistant);

        return Response::structured([
            'booked' => true,
            'customer_emailed' => filled($appointment->customer?->email),
            // Reload so database defaults are present.
            'appointment' => AppointmentData::detail($user, $appointment->refresh()->load(AppointmentData::RELATIONS), $this->timezone($team)),
        ]);
    }

    /**
     * The one place the specialist offers an in-person service, so the user
     * need not name it; null when there are several (or none) to choose from.
     */
    protected function onlyLocation(Team $team, int $serviceId, int $specialistId): ?int
    {
        $service = $team->services()->find($serviceId);

        if (! $service instanceof Service || $service->delivery_type !== DeliveryType::Onsite) {
            return null;
        }

        $locationIds = $service->locations()
            ->where('locations.is_active', true)
            ->whereHas('specialists', fn ($query) => $query->whereKey($specialistId))
            ->pluck('locations.id');

        return $locationIds->count() === 1 ? $locationIds->first() : null;
    }
}
