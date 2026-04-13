<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\UpdateCommentRequest;
use App\Enums\NotificationType;
use App\Models\Answers;
use App\Models\Blog;
use App\Models\Questions;
use App\Services\NotificationService;

class CommentController extends Controller
{
    public function store(StoreCommentRequest $request, NotificationService $notificationService)
    {
        $this->authorize('create', Comment::class);

        $morphMap = [
            'blog'     => 'App\Models\Blog',
            'answer'   => 'App\Models\Answers',
            'question' => 'App\Models\Questions',
        ];

        $comment = Comment::create([
            'content'          => $request->input('content'),
            'you_coder_id'     => $request->user()->id,
            'commentable_id'   => $request->input('commentable_id'),
            'commentable_type' => $morphMap[$request->input('commentable_type')],
        ]);

        $modelClass = $morphMap[$request->input('commentable_type')];

        $target = $modelClass::findOrFail($request->input('commentable_id'));

        $owner = $target->youCoder;

        if ($owner && $owner->id !== $request->user()->id) {
            $notificationService->send(
                recipient: $owner,
                type: NotificationType::Comment,
                title: 'New comment on your content',
                content: "{$request->user()->name} commented on your {$request->input('commentable_type')}.",
                actor: $request->user(),
                data: [
                    'comment_id' => $comment->id,
                    'commentable_id' => $comment->commentable_id,
                    'commentable_type' => $request->input('commentable_type'),
                ],
            );
        }




        return response()->json($comment->load('youCoder:id,name,photo'), 201);
    }

    public function show(Comment $comment)
    {
        $this->authorize('view', $comment);
        return $comment->load('youCoder:id,name,photo');
    }

    public function update(UpdateCommentRequest $request, Comment $comment)
    {
        $this->authorize('update', $comment);
        $comment->update(['content' => $request->input('content')]);
        return response()->json($comment);
    }

    public function destroy(Comment $comment)
    {
        $this->authorize('delete', $comment);
        $comment->delete();
        return response()->json(['message' => 'Comment deleted']);
    }

    public function suspend(Comment $comment)
    {
        $this->authorize('suspend', $comment);
        $comment->delete();
        return response()->json(['message' => 'Comment suspended']);
    }

    public function restore(int $id)
    {
        $comment = Comment::withTrashed()->findOrFail($id);
        $this->authorize('restore', $comment);
        $comment->restore();
        return response()->json(['message' => 'Comment restored']);
    }
}
