<?php

namespace Database\Factories;

use App\Enums\Currency;
use App\Enums\DeliveryType;
use App\Enums\PriceType;
use App\Enums\ServiceType;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Team;
use App\Support\ServiceOptions;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $serviceType = fake()->randomElement(ServiceType::cases());
        $deliveryType = fake()->randomElement(DeliveryType::cases());

        return [
            'service_category_id' => ServiceCategory::factory(),
            // Callers typically pass a category and nothing else, so the team is
            // taken from it to keep the two consistent. Uncategorized services
            // get their own team instead — see the `uncategorized` state.
            'team_id' => fn (array $attributes) => $attributes['service_category_id'] === null
                ? Team::factory()
                : ServiceCategory::withTrashed()
                    ->whereKey($attributes['service_category_id'])
                    ->value('team_id'),
            'is_active' => true,
            'title' => fake()->words(3, true),
            'price_type' => PriceType::Fixed,
            'price' => fake()->randomFloat(2, 10, 500),
            'price_min' => null,
            'price_max' => null,
            'currency' => Currency::Default,
            'duration' => fake()->numberBetween(15, 240),
            'technical_break' => fake()->numberBetween(0, 30),
            'service_type' => $serviceType,
            'delivery_type' => $deliveryType,
            'online_meeting_provider' => $deliveryType === DeliveryType::Online
                ? fake()->randomElement(ServiceOptions::meetingProviderKeys())
                : null,
            'capacity' => $serviceType === ServiceType::Group
                ? fake()->numberBetween(2, 20)
                : null,
            'description' => fake()->optional()->paragraph(),
        ];
    }

    /**
     * Indicate that the service is free.
     */
    public function free(): static
    {
        return $this->state(fn (array $attributes) => [
            'price_type' => PriceType::Free,
            'price' => null,
            'price_min' => null,
            'price_max' => null,
        ]);
    }

    /**
     * Indicate that the service uses a price range.
     */
    public function range(): static
    {
        return $this->state(fn (array $attributes) => [
            'price_type' => PriceType::Range,
            'price' => null,
            'price_min' => 50,
            'price_max' => 200,
        ]);
    }

    /**
     * Indicate that the service has not been given a category.
     */
    public function uncategorized(): static
    {
        return $this->state(fn (array $attributes) => [
            'service_category_id' => null,
        ]);
    }

    /**
     * Indicate that the service is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
