<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\Team;
use App\Support\LocationOptions;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Location>
 */
class LocationFactory extends Factory
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
            'is_active' => true,
            'name' => fake()->company().' '.fake()->city(),
            'country' => fake()->randomElement(LocationOptions::countryCodes()),
            'city' => fake()->city(),
            'street_address' => fake()->streetAddress(),
            'unit' => fake()->optional()->secondaryAddress(),
            'postal_code' => fake()->postcode(),
            'phone' => fake()->optional()->phoneNumber(),
        ];
    }

    /**
     * Indicate that the address was resolved through Google Places, giving
     * the location coordinates and a canonical address.
     */
    public function geocoded(): static
    {
        return $this->state(fn (array $attributes): array => [
            'place_id' => 'ChIJ'.fake()->regexify('[A-Za-z0-9_-]{23}'),
            'formatted_address' => $attributes['street_address'].', '
                .$attributes['postal_code'].' '.$attributes['city'],
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
        ]);
    }

    /**
     * Indicate that the location is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
