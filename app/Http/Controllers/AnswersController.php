<?php

namespace App\Http\Controllers;

use App\Enums\NotificationType;
use App\Enums\ReputationReason;
use App\Models\Answers;
use App\Http\Requests\StoreAnswersRequest;
use App\Http\Requests\UpdateAnswersRequest;
use App\Models\Questions;
use App\Services\NotificationService;
use App\Services\ReputationService;

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
     * Store a newly created resource in storage.
     */
    public function store(StoreAnswersRequest $request, NotificationService $notificationService)
    {
        $this->authorize('create', Answers::class);

        $question = Questions::findOrFail($request->input('question_id'));

        $answer = Answers::create([
            'content' => $request->input('content'),
            'question_id' => $request->input('question_id'),
            'you_coder_id' => $request->user()->id,
        ]);

        $recipient = $question->youCoder;

        if ($recipient && $recipient->id !== $request->user()->id) {
            $notificationService->send(
                recipient: $recipient,
                type: NotificationType::Answer,
                title: 'New answer to your question',
                content: "{$request->user()->name} answered your question: {$question->title}",
                actor: $request->user(),
                data: [
                    'question_id' => $question->id,
                    'answer_id' => $answer->id,
                    'action' => 'created',
                ],
            );
        }

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

    public function accept(
        Answers $answer,
        NotificationService $notificationService,
        ReputationService $reputationService
    )
    
    {
        $this->authorize('accept', $answer);
        $wasAccepted = $answer->is_accepted;
        $answer->update(['is_accepted' => true]);

        Answers::where('question_id', $answer->question_id)
            ->where('id', '!=', $answer->id)
            ->update(['is_accepted' => false]);

        $recipient = $answer->youCoder;

        if ($recipient && $recipient->id !== request()->user()->id) {
            if (!$wasAccepted) {
                $reputationService->apply($recipient, ReputationReason::AnswerAccepted);
            }

            $notificationService->send(
                recipient: $recipient,
                type: NotificationType::Answer,
                title: 'Your answer was accepted',
                content: request()->user()->name . " accepted your answer on the question: {$answer->question->title}",
                actor: request()->user(),
                data: [
                    'answer_id' => $answer->id,
                    'question_id' => $answer->question_id,
                    'action' => 'accepted',
                ],
            );
        }

        return response()->json(['message' => 'Answer accepted']);
    }
}
