<?php

namespace Database\Factories;

use App\Models\DevicePushToken;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<DevicePushToken>
 */
class DevicePushTokenFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'personal_access_token_id' => null,
            'token' => 'ExponentPushToken['.Str::random(22).']',
            'platform' => fake()->randomElement(['ios', 'android']),
        ];
    }
}
