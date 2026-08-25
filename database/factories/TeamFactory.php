<?php

namespace Database\Factories;

use App\Enums\BusinessCategory;
use App\Enums\TeamType;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Team>
 */
class TeamFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'is_personal' => false,
            'type' => TeamType::Organisation,
            'timezone' => fake()->timezone(),
            'business_category' => fake()->randomElement(
                array_values(array_filter(BusinessCategory::cases(), fn (BusinessCategory $category): bool => $category !== BusinessCategory::Other))
            ),
        ];
    }

    /**
     * Indicate that the team is the platform operator team.
     *
     * `is_operator` is deliberately not fillable, so it is force-filled rather
     * than passed as a state attribute (which mass assignment would drop).
     */
    public function operator(): static
    {
        return $this->afterMaking(fn (Team $team) => $team->forceFill(['is_operator' => true]));
    }

    /**
     * Indicate that the team is a personal team.
     */
    public function personal(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_personal' => true,
        ]);
    }

    /**
     * Indicate that the team has been deleted.
     */
    public function trashed(): static
    {
        return $this->state(fn (array $attributes) => [
            'deleted_at' => now(),
        ]);
    }
}
