<?php

namespace App\Http\Controllers;

use App\Enums\ChatType;
use App\Http\Requests\StoreChatRequest;
use App\Models\Chat;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Chat::class);

        return $request->user()
            ->chats()
            ->with('members:id,name,photo')
            ->latest()
            ->paginate(10);
    }

    public function store(StoreChatRequest $request)
    {
        $this->authorize('create', Chat::class);

        $authUser = $request->user();
        $memberIds = collect($request->input('member_ids'))
            ->push($authUser->id)
            ->unique()
            ->values();

        if ($request->input('type') === ChatType::Private->value) {
            $existingChat = Chat::query()
                ->where('type', ChatType::Private)
                ->whereHas('members', function ($query) use ($memberIds) {
                    $query->whereIn('users.id', $memberIds);
                }, '=', 2)
                ->withCount('members')
                ->get()
                ->first(function ($chat) {
                    return $chat->members_count === 2;
                });

            if ($existingChat) {
                return response()->json([
                    'message' => 'Private chat already exists',
                    'chat' => $existingChat->load('members:id,name,photo'),
                ], 409);
            }
        }

        $chat = Chat::create([
            'name' => $request->input('name'),
            'type' => $request->input('type'),
        ]);

        $chat->members()->attach(
            $memberIds->mapWithKeys(fn($id) => [
                $id => ['joined_at' => now()],
            ])->toArray()
        );

        return response()->json(
            $chat->load('members:id,name,photo'),
            201
        );
    }

    public function show(Chat $chat)
    {
        $this->authorize('view', $chat);

        return $chat->load([
            'members:id,name,photo',
            'messages.sender:id,name,photo',
        ]);
    }
}
