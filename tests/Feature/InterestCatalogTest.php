<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Interest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InterestCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_interests(): void
    {
        Interest::factory()->count(2)->create();
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/interests');

        $response->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_admin_can_create_interest(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/interests', [
            'name' => 'Cloud Builders',
            'type' => 'cloud_computing',
            'icon' => 'cloud-builders',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('interests', [
            'name' => 'Cloud Builders',
            'type' => 'cloud_computing',
        ]);
    }

    public function test_non_admin_cannot_create_interest(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/interests', [
            'name' => 'Cloud Builders',
            'type' => 'cloud_computing',
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_update_interest(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
        ]);
        $interest = Interest::factory()->create([
            'name' => 'API Design',
            'type' => 'software_architecture',
        ]);

        $response = $this->actingAs($admin, 'sanctum')->putJson("/api/interests/{$interest->id}", [
            'name' => 'Advanced API Design',
            'type' => 'software_architecture',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('interests', [
            'id' => $interest->id,
            'name' => 'Advanced API Design',
        ]);
    }

    public function test_admin_can_delete_interest(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
        ]);
        $interest = Interest::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/interests/{$interest->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('interests', [
            'id' => $interest->id,
        ]);
    }
}
