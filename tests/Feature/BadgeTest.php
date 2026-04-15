<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Badge;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BadgeTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_badges(): void
    {
        Badge::factory()->count(2)->create();
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/badges');

        $response->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_admin_can_create_badge(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/badges', [
            'name' => 'Top Helper',
            'description' => 'Awarded to helpful students.',
            'icon' => 'badge-star',
            'points_required' => 100,
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('badges', [
            'name' => 'Top Helper',
            'points_required' => 100,
        ]);
    }

    public function test_non_admin_cannot_create_badge(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Student,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/badges', [
            'name' => 'Top Helper',
            'points_required' => 100,
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_update_badge(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
        ]);
        $badge = Badge::factory()->create([
            'name' => 'Starter',
            'points_required' => 10,
        ]);

        $response = $this->actingAs($admin, 'sanctum')->putJson("/api/badges/{$badge->id}", [
            'name' => 'Expert Starter',
            'points_required' => 25,
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('badges', [
            'id' => $badge->id,
            'name' => 'Expert Starter',
            'points_required' => 25,
        ]);
    }

    public function test_admin_can_delete_badge(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
        ]);
        $badge = Badge::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/badges/{$badge->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('badges', [
            'id' => $badge->id,
        ]);
    }
}
