<?php

namespace Database\Factories;

use App\Enums\ReminderChannel;
use App\Enums\ReminderOffset;
use App\Enums\ReminderStatus;
use App\Models\Appointment;
use App\Models\AppointmentReminder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AppointmentReminder>
 */
class AppointmentReminderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $offset = ReminderOffset::DEFAULT;

        return [
            'appointment_id' => Appointment::factory(),
            'channel' => ReminderChannel::Email,
            'offset_minutes' => $offset->value,
            'send_at' => now()->addDay(),
            'status' => ReminderStatus::Pending,
            'sent_at' => null,
        ];
    }

    /**
     * Indicate that the reminder is already due to be sent.
     */
    public function due(): static
    {
        return $this->state(fn (array $attributes): array => [
            'send_at' => now()->subMinute(),
        ]);
    }
}
