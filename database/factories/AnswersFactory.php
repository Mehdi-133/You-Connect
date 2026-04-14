<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Questions;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Answers>
 */
class AnswersFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content' => fake()->paragraph(),
            'is_accepted' => false,
            'is_highlighted' => false,
            'vote_count' => 0,
            'question_id' => Questions::factory(),
            'you_coder_id' => User::factory(),
        ];
    }
}
