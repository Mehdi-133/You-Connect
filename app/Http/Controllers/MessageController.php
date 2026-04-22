<?php

namespace App\Http\Controllers;

use App\Enums\MessageType;
use App\Events\MessageDeleted;
use App\Events\MessageSent;
use App\Events\MessageUpdated;
use App\Http\Requests\StoreMessageRequest;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Http\Requests\UpdateMessageRequest;
use Database\Factories\MessageFactory;


class MessageController extends Controller
{
    public function index(Chat $chat)
    {
        $this->authorize('view', $chat);

        return $chat->messages()
            ->with('sender:id,name,photo')
            ->latest()
            ->paginate(20);
    }

    public function store(StoreMessageRequest $request, Chat $chat)
    {
        $this->authorize('sendMessage', $chat);

        $message = Message::create([
            'content' => $request->input('content'),
            'type' => $request->input('type', MessageType::Text->value),
            'chat_id' => $chat->id,
            'sender_id' => $request->user()->id,
        ]);

        $message->load('sender:id,name,photo');
        broadcast(new MessageSent($message))->toOthers();

        return response()->json(
            $message,
            201
        );
    }


    public function update(UpdateMessageRequest $request, Message $message)
    {
        $this->authorize('update', $message);

        if ($message->type !== MessageType::Text) {
            return response()->json([
                'message' => 'Only text messages can be updated',
            ], 422);
        }

        $message->update([
            'content' => $request->input('content'),
        ]);

        $message->load('sender:id,name,photo');
        broadcast(new MessageUpdated($message))->toOthers();

        return response()->json($message);
    }


    public function destroy(Message $message)
    {
        $this->authorize('delete', $message);

        $chatId = $message->chat_id;
        $messageId = $message->id;

        $message->delete();

        broadcast(new MessageDeleted($chatId, $messageId))->toOthers();

        return response()->json([
            'message' => 'Message deleted',
        ]);
    }
}
