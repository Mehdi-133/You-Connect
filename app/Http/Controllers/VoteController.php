<?php

namespace App\Http\Controllers;

use App\Enums\NotificationType;
use App\Enums\ReputationReason;
use App\Enums\VoteType;
use App\Http\Requests\StoreVoteRequest;
use App\Models\Answers;
use App\Models\Vote;
use App\Services\NotificationService;
use App\Services\ReputationService;

class VoteController extends Controller
{
    public function store(
        StoreVoteRequest $request,
        NotificationService $notificationService,
        ReputationService $reputationService
    )
    {
        $answer = Answers::findOrFail($request->input('answer_id'));
        $requestedType = VoteType::from($request->input('type'));

        $this->authorize('create', [Vote::class, $answer]);

        $existing = Vote::where('you_coder_id', $request->user()->id)
            ->where('answer_id', $answer->id)
            ->first();

        if ($existing) {
            if ($existing->type === $requestedType) {
                $existing->delete();
                $answer->decrement('vote_count');
                return response()->json(['message' => 'Vote removed']);
            } else {
                $existing->update(['type' => $requestedType]);

                if ($requestedType === VoteType::UpVote) {
                    $recipient = $answer->youCoder;

                    if ($recipient && $recipient->id !== $request->user()->id) {
                        $notificationService->send(
                            recipient: $recipient,
                            type: NotificationType::Vote,
                            title: 'New upvote on your answer',
                            content: "{$request->user()->name} upvoted your answer.",
                            actor: $request->user(),
                            data: [
                                'answer_id' => $answer->id,
                                'question_id' => $answer->question_id,
                                'action' => 'upvoted',
                            ],
                        );
                    }
                }

                return response()->json(['message' => 'Vote switched', 'vote' => $existing]);
            }
        }

        $vote = Vote::create([
            'you_coder_id' => $request->user()->id,
            'answer_id' => $answer->id,
            'type' => $requestedType,
        ]);

        $answer->increment('vote_count');

        $recipient = $answer->youCoder;

        if ($recipient && $recipient->id !== $request->user()->id) {
            if ($requestedType === VoteType::UpVote) {
                $reputationService->apply($recipient, ReputationReason::AnswerUpvoted);

                $notificationService->send(
                    recipient: $recipient,
                    type: NotificationType::Vote,
                    title: 'New upvote on your answer',
                    content: "{$request->user()->name} upvoted your answer.",
                    actor: $request->user(),
                    data: [
                        'answer_id' => $answer->id,
                        'question_id' => $answer->question_id,
                        'action' => 'upvoted',
                    ],
                );
            }

            if ($requestedType === VoteType::DownVote) {
                $reputationService->apply($recipient, ReputationReason::AnswerDownvoted);
            }
        }

        return response()->json($vote, 201);
    }

    public function destroy(Vote $vote)
    {
        $this->authorize('delete', $vote);
        $vote->delete();
        $vote->answer->decrement('vote_count');
        return response()->json(['message' => 'Vote removed']);
    }
}
