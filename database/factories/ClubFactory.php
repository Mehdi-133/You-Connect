<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Club>
 */
class ClubFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);
        $seed = preg_replace('/[^a-z0-9-]+/i', '-', strtolower($name));

        return [
            'name' => $name,
            'logo' => "https://picsum.photos/seed/{$seed}/256/256",
            'description' => fake()->optional(0.9)->sentence(12),
            'creator_id' => User::factory(),
            'is_suspended' => false,
        ];
    }
}
