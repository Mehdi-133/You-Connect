<?php

namespace App\Http\Controllers;

use App\Models\Questions;
use App\Http\Requests\StoreQuestionsRequest;
use App\Http\Requests\UpdateQuestionsRequest;
use Illuminate\Support\Str;

class QuestionsController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Questions::class);
        $tagId = request()->query('tag_id');

        $query = Questions::with(['youCoder:id,name,photo', 'tags:id,name'])
            ->withCount(['answers as live_answers_count'])
            ->latest();

        if ($tagId) {
            $query->whereHas('tags', fn ($tagQuery) => $tagQuery->where('tags.id', $tagId));
        }

        return $query->paginate(10);
    }

    public function store(StoreQuestionsRequest $request)
    {
        $this->authorize('create', Questions::class);

        $question = Questions::create([
            'title'        => $request->input('title'),
            'content'      => $request->input('content'),
            'slug'         => Str::slug($request->input('title')) . '-' . Str::random(6),
            'you_coder_id' => $request->user()->id,
        ]);

        if ($request->input('tags')) {
            $question->tags()->sync($request->input('tags'));
        }

        return response()->json(
            $question->load('tags')->loadCount(['answers as live_answers_count']),
            201
        );
    }

    public function show(Questions $question)
    {
        $this->authorize('view', $question);
        return $question
            ->load(['youCoder:id,name,photo', 'tags:id,name', 'answers'])
            ->loadCount(['answers as live_answers_count']);
    }

    public function update(UpdateQuestionsRequest $request, Questions $question)
    {
        $this->authorize('update', $question);

        $question->update($request->only(['title', 'content']));

        if ($request->has('tags')) {
            $question->tags()->sync($request->input('tags') ?? []);
        }

        return response()->json(
            $question->load('tags')->loadCount(['answers as live_answers_count'])
        );
    }

    public function destroy(Questions $question)
    {
        $this->authorize('delete', $question);
        $question->delete();
        return response()->json(['message' => 'Question deleted']);
    }

    public function suspend(Questions $question)
    {
        $this->authorize('suspend', $question);
        $question->update(['status' => 'closed']);
        return response()->json(['message' => 'Question suspended']);
    }

    public function restore(Questions $question)
    {
        $this->authorize('restore', $question);
        $question->update(['status' => 'open']);
        return response()->json(['message' => 'Question restored']);
    }
}
