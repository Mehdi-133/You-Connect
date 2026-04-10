<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Http\Requests\StoreBlogRequest;
use App\Http\Requests\UpdateBlogRequest;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', Blog::class);
        return Blog::with('youCoder:id,name,photo')->latest()->paginate(10);
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
    public function store(StoreBlogRequest $request)
    {
        $this->authorize('create', Blog::class);

        $blog = Blog::create([
            'title' => $request->input('title'),
            'content' => $request->input('content'),
            'slug' => Str::slug($request->input('title')) . '-' . Str::random(6),
            'you_coder_id' => $request->user()->id,
            'status' => 'pending',
        ]);

        return response()->json($blog, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Blog $blog)
    {
        $this->authorize('view', $blog);
        return $blog->load(['youCoder:id,name,photo', 'comments']);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Blog $blog)
    {

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBlogRequest $request, Blog $blog)
    {
        $this->authorize('update', $blog);
        $blog->update($request->only(['title', 'content']));
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

    public function approve(Blog $blog)
    {
        $this->authorize('approve', $blog);
        $blog->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);
        return response()->json(['message' => 'Blog approved']);
    }

    public function reject(Blog $blog)
    {
        $this->authorize('approve', $blog);
        $blog->update(['status' => 'rejected']);
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
