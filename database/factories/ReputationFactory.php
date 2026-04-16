<?php

namespace Database\Factories;
use App\Models\User;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Reputation>
 */
class ReputationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'you_coder_id' => User::factory(),
            'points' => fake()->numberBetween(-5, 20),
            'reason' => fake()->word(),
        ];
    }
}
