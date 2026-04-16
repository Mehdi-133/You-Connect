<?php

namespace App\Http\Controllers;

use App\Models\Reputation;
use App\Models\User;
use Illuminate\Http\Request;

class ReputationController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Reputation::class);

        $userId = $request->query('user_id');

        if ($userId) {
            $targetUser = User::findOrFail($userId);

            if ($request->user()->id !== $targetUser->id && !$request->user()->isAdmin()) {
                return response()->json([
                    'message' => 'You do not have permission to view this reputation history.',
                ], 403);
            }

            return Reputation::where('you_coder_id', $targetUser->id)
                ->latest()
                ->paginate(15);
        }

        return Reputation::where('you_coder_id', $request->user()->id)
            ->latest()
            ->paginate(15);
    }

    public function show(Reputation $reputation)
    {
        $this->authorize('view', $reputation);

        return $reputation;
    }

    public function userScore(User $user, Request $request)
    {
        if ($request->user()->id !== $user->id && !$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'You do not have permission to view this score.',
            ], 403);
        }

        return response()->json([
            'user_id' => $user->id,
            'reputation' => $user->reputation,
        ]);
    }
}
