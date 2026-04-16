<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Enums\MessageType;
use App\Models\Chat;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content' => fake()->sentence(),
            'type' => MessageType::Text->value,
            'is_read' => false,
            'chat_id' => Chat::factory(),
            'sender_id' => User::factory(),
        ];
    }
}
