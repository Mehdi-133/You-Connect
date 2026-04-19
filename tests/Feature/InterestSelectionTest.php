<?php

namespace Tests\Feature;

use App\Models\Interest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InterestSelectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_add_interest_to_their_profile(): void
    {
        $user = User::factory()->create();
        $interest = Interest::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/users/{$user->id}/interests/{$interest->id}");

        $response->assertStatus(201)
            ->assertJsonPath('message', 'Interest added successfully');

        $this->assertDatabaseHas('interest_user', [
            'you_coder_id' => $user->id,
            'interest_id' => $interest->id,
        ]);
    }

    public function test_user_can_remove_interest_from_their_profile(): void
    {
        $user = User::factory()->create();
        $interest = Interest::factory()->create();

        $user->interests()->attach($interest->id, [
            'selected_at' => now(),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/users/{$user->id}/interests/{$interest->id}");

        $response->assertOk()
            ->assertJsonPath('message', 'Interest removed successfully');

        $this->assertDatabaseMissing('interest_user', [
            'you_coder_id' => $user->id,
            'interest_id' => $interest->id,
        ]);
    }

    public function test_user_cannot_add_interest_to_another_profile(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $interest = Interest::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/users/{$otherUser->id}/interests/{$interest->id}");

        $response->assertForbidden();
    }
}
