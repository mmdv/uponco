<?php

namespace Database\Factories;

use App\Enums\OnboardingStep;
use App\Enums\OnboardingStepStatus;
use App\Models\OnboardingProgress;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OnboardingProgress>
 */
class OnboardingProgressFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'user_id' => User::factory(),
            'general_status' => OnboardingStepStatus::Pending,
            'locations_status' => OnboardingStepStatus::Pending,
            'services_status' => OnboardingStepStatus::Pending,
            'profile_status' => OnboardingStepStatus::Pending,
            'current_step' => OnboardingStep::General,
            'completed_at' => null,
        ];
    }

    /**
     * Indicate that every onboarding step has been completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'general_status' => OnboardingStepStatus::Completed,
            'locations_status' => OnboardingStepStatus::Completed,
            'services_status' => OnboardingStepStatus::Completed,
            'profile_status' => OnboardingStepStatus::Completed,
            'current_step' => OnboardingStep::Profile,
            'completed_at' => now(),
        ]);
    }
}
