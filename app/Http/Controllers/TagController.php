<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTagRequest;
use App\Http\Requests\UpdateTagRequest;
use App\Models\Tag;
use Illuminate\Support\Str;

class TagController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Tag::class);

        return Tag::withCount('questions')->latest()->paginate(10);
    }

    public function store(StoreTagRequest $request)
    {
        $this->authorize('create', Tag::class);

        $tag = Tag::create([
            'name' => $request->input('name'),
            'slug' => Str::slug($request->input('name')),
            'description' => $request->input('description'),
        ]);

        return response()->json($tag, 201);
    }

    public function show(Tag $tag)
    {
        $this->authorize('view', $tag);

        return $tag->loadCount('questions');
    }

    public function update(UpdateTagRequest $request, Tag $tag)
    {
        $this->authorize('update', $tag);

        $data = $request->only(['name', 'description']);

        if ($request->filled('name')) {
            $data['slug'] = Str::slug($request->input('name'));
        }

        $tag->update($data);

        return response()->json($tag);
    }

    public function destroy(Tag $tag)
    {
        $this->authorize('delete', $tag);

        $tag->delete();

        return response()->json([
            'message' => 'Tag deleted',
        ]);
    }
}
