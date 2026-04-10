<?php

namespace App\Http\Controllers;

use App\Models\Answers;
use App\Http\Requests\StoreAnswersRequest;
use App\Http\Requests\UpdateAnswersRequest;
use App\Models\Questions;

class AnswersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Questions $question)
    {
        $this->authorize('viewAny', Answers::class);
        return $question->answers()->with('youCoder:id,name,photo')->latest()->get();
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
    public function store(StoreAnswersRequest $request)
    {
        $this->authorize('create', Answers::class);

        $answer = Answers::create([
            'content' => $request->input('content'),
            'question_id' => $request->input('question_id'),
            'you_coder_id' => $request->user()->id,
        ]);

        return response()->json($answer->load('youCoder:id,name,photo'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Answers $answer)
    {
        $this->authorize('view', $answer);
        return $answer->load(['youCoder:id,name,photo', 'comments']);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Answers $answers)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAnswersRequest $request, Answers $answer)
    {
        $this->authorize('update', $answer);
        $answer->update(['content' => $request->input('content')]);
        return response()->json($answer);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Answers $answer)
    {
        $this->authorize('delete', $answer);
        $answer->delete();
        return response()->json(['message' => 'Answer deleted']);
    }

    public function suspend(Answers $answer)
    {
        $this->authorize('suspend', $answer);
        $answer->update(['is_accepted' => false]);
        return response()->json(['message' => 'Answer suspended']);
    }

    public function highlight(Answers $answer)
    {
        $this->authorize('highlight', $answer);
        $answer->update(['is_highlighted' => !$answer->is_highlighted]);
        $status = $answer->is_highlighted ? 'highlighted' : 'unhighlighted';
        return response()->json(['message' => "Answer {$status}"]);
    }

    public function accept(Answers $answer)
    {
        $this->authorize('accept', $answer);
        $answer->update(['is_accepted' => true]);

        Answers::where('question_id', $answer->question_id)
            ->where('id', '!=', $answer->id)
            ->update(['is_accepted' => false]);

        return response()->json(['message' => 'Answer accepted']);
    }
}
