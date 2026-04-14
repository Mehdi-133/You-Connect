<?php

namespace Database\Factories;

use Illuminate\Support\Str;
use App\Models\User;


use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Blog>
 */
class BlogFactory extends Factory
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
            'title' => $title,
            'content' => fake()->paragraph(),
            'slug' => Str::slug($title) . '-' . Str::random(6),
            'status' => 'pending',
            'like_count' => 0,
            'is_highlighted' => false,
            'approved_at' => null,
            'you_coder_id' => User::factory(),
        ];
    }
}
