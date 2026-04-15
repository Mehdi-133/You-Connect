<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TagTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_tags(): void
    {
        Tag::factory()->count(2)->create();
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/tags');

        $response->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_admin_can_create_tag(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
        ]);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/tags', [
            'name' => 'Laravel',
            'description' => 'Laravel framework questions',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('tags', [
            'name' => 'Laravel',
            'slug' => 'laravel',
        ]);
    }

    public function test_formateur_can_create_tag(): void
    {
        $formateur = User::factory()->create([
            'role' => UserRole::Formateur,
        ]);

        $response = $this->actingAs($formateur, 'sanctum')->postJson('/api/tags', [
            'name' => 'React',
            'description' => 'React related questions',
        ]);

        $response->assertStatus(201);
    }

    public function test_student_cannot_create_tag(): void
    {
        $student = User::factory()->create([
            'role' => UserRole::Student,
        ]);

        $response = $this->actingAs($student, 'sanctum')->postJson('/api/tags', [
            'name' => 'PHP',
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_update_tag(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
        ]);
        $tag = Tag::factory()->create([
            'name' => 'Php',
            'slug' => 'php',
        ]);

        $response = $this->actingAs($admin, 'sanctum')->putJson("/api/tags/{$tag->id}", [
            'name' => 'PHP Advanced',
            'description' => 'Advanced PHP questions',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('tags', [
            'id' => $tag->id,
            'name' => 'PHP Advanced',
            'slug' => 'php-advanced',
        ]);
    }

    public function test_admin_can_delete_tag(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
        ]);
        $tag = Tag::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/tags/{$tag->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('tags', [
            'id' => $tag->id,
        ]);
    }

    public function test_formateur_cannot_delete_tag(): void
    {
        $formateur = User::factory()->create([
            'role' => UserRole::Formateur,
        ]);
        $tag = Tag::factory()->create();

        $response = $this->actingAs($formateur, 'sanctum')->deleteJson("/api/tags/{$tag->id}");

        $response->assertForbidden();
    }
}
