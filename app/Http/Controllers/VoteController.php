<?php

namespace App\Http\Controllers;

use App\Models\Answers;
use App\Models\Vote;
use App\Http\Requests\StoreVoteRequest;

class VoteController extends Controller
{
    public function store(StoreVoteRequest $request)
    {
        $answer = Answers::findOrFail($request->input('answer_id'));

        $this->authorize('create', [Vote::class, $answer]);

        $existing = Vote::where('you_coder_id', $request->user()->id)
            ->where('answer_id', $answer->id)
            ->first();

        if ($existing) {
            if ($existing->type->value === $request->input('type')) {
                $existing->delete();
                $answer->decrement('vote_count');
                return response()->json(['message' => 'Vote removed']);
            } else {
                $existing->update(['type' => $request->input('type')]);
                return response()->json(['message' => 'Vote switched', 'vote' => $existing]);
            }
        }

        $vote = Vote::create([
            'you_coder_id' => $request->user()->id,
            'answer_id' => $answer->id,
            'type' => $request->input('type'),
        ]);

        $answer->increment('vote_count');

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
