<?php

namespace Database\Factories;

use App\Enums\IventStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ivents>
 */
class IventsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startsAt = fake()->dateTimeBetween('+1 day', '+3 weeks');
        $endsAt = fake()->optional(0.75)->dateTimeBetween($startsAt, '+4 weeks');
        $photoId = fake()->numberBetween(100, 1100);

        return [
            'title' => fake()->sentence(3),
            'photo' => "https://picsum.photos/id/{$photoId}/1200/700",
            'description' => fake()->optional(0.9)->paragraph(),
            'location' => fake()->optional(0.8)->city(),
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'status' => IventStatus::Upcoming,
            'you_coder_id' => User::factory(),
        ];
    }
}
