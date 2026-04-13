<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\Like;
use App\Http\Requests\StoreLikeRequest;

class LikeController extends Controller
{
    public function store(StoreLikeRequest $request)
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

        return response()->json(['message' => 'Blog liked']);
    }
}
