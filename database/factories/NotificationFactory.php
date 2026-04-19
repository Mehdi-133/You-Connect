<?php

namespace Database\Factories;

use App\Enums\NotificationType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notification>
 */
class NotificationFactory extends Factory
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
            'actor_id' => User::factory(),
            'title' => fake()->sentence(3),
            'type' => NotificationType::Answer,
            'content' => fake()->sentence(),
            'data' => [],
            'is_read' => false,
        ];
    }
}
