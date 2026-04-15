<?php

namespace Database\Factories;

use App\Enums\InterestType;


use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Interest>
 */
class InterestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'type' => fake()->randomElement(array_map(fn($case) => $case->value, InterestType::cases())),
            'icon' => fake()->slug(),
        ];
    }
}
