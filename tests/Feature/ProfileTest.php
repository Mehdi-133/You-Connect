<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_update_their_own_profile(): void
    {
        $user = User::factory()->create([
            'name' => 'Before Name',
            'bio' => 'Before bio',
            'class' => 'dev room',
            'photo' => null,
        ]);

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/users/{$user->id}", [
            'name' => 'After Name',
            'bio' => 'Updated bio for profile page',
            'class' => 'dar hamza',
            'photo' => 'https://example.com/avatar.png',
        ]);

        $response->assertOk()
            ->assertJsonPath('name', 'After Name')
            ->assertJsonPath('bio', 'Updated bio for profile page')
            ->assertJsonPath('class', 'dar hamza')
            ->assertJsonPath('photo', 'https://example.com/avatar.png');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'After Name',
            'bio' => 'Updated bio for profile page',
            'class' => 'dar hamza',
            'photo' => 'https://example.com/avatar.png',
        ]);
    }

    public function test_user_cannot_update_another_profile(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create([
            'name' => 'Locked Name',
        ]);

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/users/{$otherUser->id}", [
            'name' => 'Should Not Work',
        ]);

        $response->assertForbidden();

        $this->assertDatabaseHas('users', [
            'id' => $otherUser->id,
            'name' => 'Locked Name',
        ]);
    }
}
