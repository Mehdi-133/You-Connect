<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\User;


/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Questions>
 */
class QuestionsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence();

        return [
            'you_coder_id' => User::factory(),
            'title' => $title,
            'content' => fake()->paragraph(),
            'slug' => Str::slug($title) . '-' . Str::random(6),
            'status' => 'open',
            'answers_count' => 0,
        ];
    }
}
