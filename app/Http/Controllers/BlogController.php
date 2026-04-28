<?php

namespace App\Http\Controllers;

use App\Enums\NotificationType;
use App\Enums\ReputationReason;
use App\Enums\UserRole;
use App\Models\Blog;
use App\Models\User;
use App\Http\Requests\StoreBlogRequest;
use App\Http\Requests\UpdateBlogRequest;
use App\Services\NotificationService;
use App\Services\ReputationService;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Blog::class);
        $perPage = (int) request()->query('per_page', 10);
        $perPage = max(1, min($perPage, 50));

        return Blog::with('youCoder:id,name,photo')
            ->withCount('comments')
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBlogRequest $request, NotificationService $notificationService)
    {
        $this->authorize('create', Blog::class);

        $blog = Blog::create([
            'title' => $request->input('title'),
            'content' => $request->input('content'),
            'slug' => Str::slug($request->input('title')) . '-' . Str::random(6),
            'photo' => $request->input('photo'),
            'you_coder_id' => $request->user()->id,
            'status' => 'pending',
        ]);

        $moderators = User::whereIn('role', [
            UserRole::Admin->value,
            UserRole::Formateur->value,
        ])
            ->where('id', '!=', $request->user()->id)
            ->get();

        foreach ($moderators as $moderator) {
            $notificationService->send(
                recipient: $moderator,
                type: NotificationType::Blog,
                title: 'New blog awaiting review',
                content: "{$request->user()->name} created a new blog: {$blog->title}",
                actor: $request->user(),
                data: [
                    'blog_id' => $blog->id,
                    'slug' => $blog->slug,
                    'action' => 'created',
                ],
            );
        }


        return response()->json($blog, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Blog $blog)
    {
        $this->authorize('view', $blog);
        return $blog->load([
            'youCoder:id,name,photo',
            'comments.youCoder:id,name,photo',
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Blog $blog) {}

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBlogRequest $request, Blog $blog)
    {
        $this->authorize('update', $blog);
        $blog->update($request->only(['title', 'content', 'photo']));
        return response()->json($blog);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Blog $blog)
    {
        $this->authorize('delete', $blog);
        $blog->delete();
        return response()->json(['message' => 'Blog deleted']);
    }

    public function approve(
        Blog $blog,
        NotificationService $notificationService,
        ReputationService $reputationService
    )
    {
        $this->authorize('approve', $blog);
        $wasApproved = $blog->status === \App\Enums\BlogStatus::Approved;
        $blog->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        $recipient = $blog->youCoder;

        if ($recipient && $recipient->id !== request()->user()->id) {
            if (!$wasApproved) {
                $reputationService->apply($recipient, ReputationReason::BlogApproved);
            }

            $notificationService->send(
                recipient: $recipient,
                type: NotificationType::Blog,
                title: 'Your blog was approved',
                content: request()->user()->name . " approved your blog: {$blog->title}",
                actor: request()->user(),
                data: [
                    'blog_id' => $blog->id,
                    'slug' => $blog->slug,
                    'action' => 'approved',
                ],
            );
        }

        return response()->json(['message' => 'Blog approved']);
    }

    public function reject(Blog $blog, NotificationService $notificationService)
    {
        $this->authorize('approve', $blog);
        $blog->update(['status' => 'rejected']);

        $recipient = $blog->youCoder;

        if ($recipient && $recipient->id !== request()->user()->id) {
            $notificationService->send(
                recipient: $recipient,
                type: NotificationType::Blog,
                title: 'Your blog was rejected',
                content: request()->user()->name . " rejected your blog: {$blog->title}",
                actor: request()->user(),
                data: [
                    'blog_id' => $blog->id,
                    'slug' => $blog->slug,
                    'action' => 'rejected',
                ],
            );
        }

        return response()->json(['message' => 'Blog rejected']);
    }

    public function suspend(Blog $blog)
    {
        $this->authorize('suspend', $blog);
        $blog->update(['status' => 'pending']);
        return response()->json(['message' => 'Blog suspended']);
    }

    public function restore(Blog $blog)
    {
        $this->authorize('restore', $blog);
        $blog->update(['status' => 'approved']);
        return response()->json(['message' => 'Blog restored']);
    }

    public function highlight(Blog $blog)
    {
        $this->authorize('highlight', $blog);
        $blog->update(['is_highlighted' => !$blog->is_highlighted]);
        $status = $blog->is_highlighted ? 'highlighted' : 'unhighlighted';
        return response()->json(['message' => "Blog {$status}"]);
    }
}
