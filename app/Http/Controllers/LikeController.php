<?php

namespace App\Http\Controllers;

use App\Enums\NotificationType;
use App\Enums\ReputationReason;
use App\Http\Requests\StoreLikeRequest;
use App\Models\Blog;
use App\Models\Like;
use App\Services\NotificationService;
use App\Services\ReputationService;

class LikeController extends Controller
{
    public function store(
        StoreLikeRequest $request,
        NotificationService $notificationService,
        ReputationService $reputationService
    )
    {
        $blog = Blog::findOrFail($request->input('blog_id'));

        $this->authorize('create', [Like::class, $blog]);

        $existing = Like::where('you_coder_id', $request->user()->id)
            ->where('blog_id', $blog->id)
            ->first();

        if ($existing) {
            Like::where('you_coder_id', $request->user()->id)
                ->where('blog_id', $blog->id)
                ->delete();
            $blog->decrement('like_count');
            return response()->json(['message' => 'Like removed']);
        }

        Like::create([
            'you_coder_id' => $request->user()->id,
            'blog_id'      => $blog->id,
        ]);

        $blog->increment('like_count');

        $recipient = $blog->youCoder;

        if ($recipient && $recipient->id !== $request->user()->id) {
            $reputationService->apply($recipient, ReputationReason::BlogLiked);

            $notificationService->send(
                recipient: $recipient,
                type: NotificationType::Like,
                title: 'New like on your blog',
                content: "{$request->user()->name} liked your blog: {$blog->title}",
                actor: $request->user(),
                data: [
                    'blog_id' => $blog->id,
                    'action' => 'liked',
                ],
            );
        }

        return response()->json(['message' => 'Blog liked']);
    }
}
