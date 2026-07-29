<?php

namespace Database\Factories;

use App\Enums\AppointmentStatus;
use App\Enums\DeliveryType;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Location;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Appointment>
 */
class AppointmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startAt = fake()->dateTimeBetween('+1 day', '+1 month');
        $endAt = (clone $startAt)->modify('+60 minutes');

        return [
            'team_id' => Team::factory(),
            'service_id' => Service::factory(),
            'location_id' => Location::factory(),
            'specialist_id' => User::factory(),
            'customer_id' => Customer::factory(),
            'start_at' => $startAt,
            'end_at' => $endAt,
            'status' => AppointmentStatus::Booked,
            'cancelled_at' => null,
            'delivery_type' => DeliveryType::Onsite,
            'online_meeting_provider' => null,
            'meeting_url' => null,
            'client_comment' => null,
            'notes' => fake()->optional()->sentence(),
        ];
    }

    /**
     * Indicate that the appointment is delivered online without a location.
     */
    public function online(): static
    {
        return $this->state(fn (array $attributes): array => [
            'location_id' => null,
            'delivery_type' => DeliveryType::Online,
            'online_meeting_provider' => 'google_meet',
        ]);
    }

    /**
     * Indicate that the appointment has been cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => AppointmentStatus::Cancelled,
            'cancelled_at' => now(),
        ]);
    }
}
