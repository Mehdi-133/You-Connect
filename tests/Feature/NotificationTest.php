<?php

namespace Tests\Feature;

use App\Models\Answers;
use App\Models\Blog;
use App\Models\Notification;
use App\Models\Questions;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Enums\UserRole;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_answer_notification(): void
    {
        $questionOwner = User::factory()->create();
        $answerAuthor = User::factory()->create();

        $question = Questions::factory()->create([
            'you_coder_id' => $questionOwner->id,
        ]);

        $this->withoutExceptionHandling();

        $response = $this->actingAs($answerAuthor, 'sanctum')->postJson('/api/answers', [
            'content' => 'This is a test answer',
            'question_id' => $question->id,
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('notifications', [
            'you_coder_id' => $questionOwner->id,
            'actor_id' => $answerAuthor->id,
            'type' => 'answer',
            'title' => 'New answer to your question',
        ]);
    }

    public function test_answer_accept_notification(): void
    {
        $questionOwner = User::factory()->create();
        $answerAuthor = User::factory()->create();

        $question = Questions::factory()->create([
            'you_coder_id' => $questionOwner->id,
        ]);

        $answer = Answers::factory()->create([
            'question_id' => $question->id,
            'you_coder_id' => $answerAuthor->id,
            'is_accepted' => false,
        ]);

        $response = $this->actingAs($questionOwner, 'sanctum')
            ->patchJson("/api/answers/{$answer->id}/accept");

        $response->assertOk();

        $this->assertDatabaseHas('notifications', [
            'you_coder_id' => $answerAuthor->id,
            'actor_id' => $questionOwner->id,
            'type' => 'answer',
            'title' => 'Your answer was accepted',
        ]);
    }

    public function test_user_can_list_only_their_notifications_with_actor_data(): void
    {
        $recipient = User::factory()->create();
        $otherUser = User::factory()->create();
        $actor = User::factory()->create([
            'name' => 'Actor User',
        ]);

        Notification::factory()->create([
            'you_coder_id' => $recipient->id,
            'actor_id' => $actor->id,
            'title' => 'Visible notification',
        ]);

        Notification::factory()->create([
            'you_coder_id' => $otherUser->id,
            'actor_id' => $actor->id,
            'title' => 'Hidden notification',
        ]);

        $response = $this->actingAs($recipient, 'sanctum')->getJson('/api/notifications');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Visible notification')
            ->assertJsonPath('data.0.actor.name', 'Actor User');
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        $recipient = User::factory()->create();

        Notification::factory()->count(2)->create([
            'you_coder_id' => $recipient->id,
            'is_read' => false,
        ]);

        $response = $this->actingAs($recipient, 'sanctum')->patchJson('/api/notifications/read-all');

        $response->assertOk()
            ->assertJsonPath('message', 'All notifications marked as read');

        $this->assertDatabaseMissing('notifications', [
            'you_coder_id' => $recipient->id,
            'is_read' => false,
        ]);
    }

    public function test_blog_like(): void
    {
        $blogOwner = User::factory()->create();
        $liker = User::factory()->create();

        $blog = Blog::factory()->create([
            'you_coder_id' => $blogOwner->id,
        ]);

        $response = $this->actingAs($liker, 'sanctum')->postJson('/api/likes', [
            'blog_id' => $blog->id,
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('notifications', [
            'you_coder_id' => $blogOwner->id,
            'actor_id' => $liker->id,
            'type' => 'like',
            'title' => 'New like on your blog',
        ]);
    }

    public function test_answer_vote(): void
    {
        $questionOwner = User::factory()->create();
        $answerOwner = User::factory()->create();
        $voter = User::factory()->create();

        $question = Questions::factory()->create([
            'you_coder_id' => $questionOwner->id,
        ]);

        $answer = Answers::factory()->create([
            'question_id' => $question->id,
            'you_coder_id' => $answerOwner->id,
        ]);

        $response = $this->actingAs($voter, 'sanctum')->postJson('/api/votes', [
            'answer_id' => $answer->id,
            'type' => 'upVote',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('notifications', [
            'you_coder_id' => $answerOwner->id,
            'actor_id' => $voter->id,
            'type' => 'vote',
            'title' => 'New upvote on your answer',
        ]);
    }

    public function test_blog_improved(): void
    {
        $author = User::factory()->create();
        $moderator = User::factory()->create([
            'role' => UserRole::Admin,
        ]);

        $blog = Blog::factory()->create([
            'you_coder_id' => $author->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($moderator, 'sanctum')
            ->patchJson("/api/blogs/{$blog->id}/approve");

        $response->assertOk();

        $this->assertDatabaseHas('notifications', [
            'you_coder_id' => $author->id,
            'actor_id' => $moderator->id,
            'type' => 'blog',
            'title' => 'Your blog was approved',
        ]);
    }

    public function test_blog_rejected(): void
    {
        $author = User::factory()->create();
        $moderator = User::factory()->create([
            'role' => UserRole::Admin,
        ]);

        $blog = Blog::factory()->create([
            'you_coder_id' => $author->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($moderator, 'sanctum')
            ->patchJson("/api/blogs/{$blog->id}/reject");

        $response->assertOk();

        $this->assertDatabaseHas('notifications', [
            'you_coder_id' => $author->id,
            'actor_id' => $moderator->id,
            'type' => 'blog',
            'title' => 'Your blog was rejected',
        ]);
    }

    public function test_avoid_send_notification_for_their_oneAnswer(): void
    {
        $user = User::factory()->create();

        $question = Questions::factory()->create([
            'you_coder_id' => $user->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/answers', [
            'content' => 'This is my own answer',
            'question_id' => $question->id,
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseMissing('notifications', [
            'you_coder_id' => $user->id,
            'type' => 'answer',
            'title' => 'New answer to your question',
        ]);
    }


    public function test_avoid_notify_like_their_owenBlog(): void
    {
        $user = User::factory()->create();

        $blog = Blog::factory()->create([
            'you_coder_id' => $user->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/likes', [
            'blog_id' => $blog->id,
        ]);

        $response->assertStatus(403);

        $this->assertDatabaseMissing('notifications', [
            'you_coder_id' => $user->id,
            'type' => 'like',
            'title' => 'New like on your blog',
        ]);
    }


    public function test_avoid_upvote_their_own_answer(): void
    {
        $questionOwner = User::factory()->create();
        $answerOwner = User::factory()->create();

        $question = Questions::factory()->create([
            'you_coder_id' => $questionOwner->id,
        ]);

        $answer = Answers::factory()->create([
            'question_id' => $question->id,
            'you_coder_id' => $answerOwner->id,
        ]);

        $response = $this->actingAs($answerOwner, 'sanctum')->postJson('/api/votes', [
            'answer_id' => $answer->id,
            'type' => 'upVote',
        ]);

        $response->assertStatus(403);

        $this->assertDatabaseMissing('notifications', [
            'you_coder_id' => $answerOwner->id,
            'type' => 'vote',
            'title' => 'New upvote on your answer',
        ]);
    }


    public function test_avoid_notify_answer_owner_when_downvote(): void
    {
        $questionOwner = User::factory()->create();
        $answerOwner = User::factory()->create();
        $voter = User::factory()->create();

        $question = Questions::factory()->create([
            'you_coder_id' => $questionOwner->id,
        ]);

        $answer = Answers::factory()->create([
            'question_id' => $question->id,
            'you_coder_id' => $answerOwner->id,
        ]);

        $response = $this->actingAs($voter, 'sanctum')->postJson('/api/votes', [
            'answer_id' => $answer->id,
            'type' => 'downVote',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseMissing('notifications', [
            'you_coder_id' => $answerOwner->id,
            'actor_id' => $voter->id,
            'type' => 'vote',
            'title' => 'New upvote on your answer',
        ]);
    }
}
