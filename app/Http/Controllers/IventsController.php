<?php

namespace App\Http\Controllers;

use App\Models\Ivents;
use App\Enums\IventStatus;
use App\Http\Requests\StoreIventsRequest;
use App\Http\Requests\UpdateIventsRequest;

class IventsController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Ivents::class);
        return Ivents::with('creator:id,name,photo')->latest()->paginate(10);
    }

    public function store(StoreIventsRequest $request)
    {
        $this->authorize('create', Ivents::class);

        $ivent = Ivents::create([
            'title'        => $request->input('title'),
            'description'  => $request->input('description'),
            'location'     => $request->input('location'),
            'starts_at'    => $request->input('starts_at'),
            'ends_at'      => $request->input('ends_at'),
            'you_coder_id' => $request->user()->id,
        ]);

        return response()->json($ivent, 201);
    }

    public function show(Ivents $ivent)
    {
        $this->authorize('view', $ivent);
        return $ivent->load(['creator:id,name,photo', 'attendees:id,name,photo']);
    }

    public function update(UpdateIventsRequest $request, Ivents $ivent)
    {
        $this->authorize('update', $ivent);
        $ivent->update($request->only(['title', 'description', 'location', 'starts_at', 'ends_at', 'status']));
        return response()->json($ivent);
    }

    public function destroy(Ivents $ivent)
    {
        $this->authorize('delete', $ivent);
        $ivent->delete();
        return response()->json(['message' => 'Event deleted']);
    }

    public function cancel(Ivents $ivent)
    {
        $this->authorize('cancel', $ivent);
        $ivent->update(['status' => IventStatus::Cancelled]);
        return response()->json(['message' => 'Event cancelled']);
    }

    public function suspend(Ivents $ivent)
    {
        $this->authorize('suspend', $ivent);
        $ivent->update(['status' => IventStatus::Suspended]);
        return response()->json(['message' => 'Event suspended']);
    }

    public function restore(Ivents $ivent)
    {
        $this->authorize('restore', $ivent);
        $ivent->update(['status' => IventStatus::Upcoming]);
        return response()->json(['message' => 'Event restored']);
    }

    public function join(Ivents $ivent)
    {
        $this->authorize('join', $ivent);

        if (in_array($ivent->status, [IventStatus::Cancelled, IventStatus::Suspended, IventStatus::Finished])) {
            return response()->json(['message' => 'Cannot join this event'], 403);
        }

        $userId = request()->user()->id;

        if ($ivent->attendees()->where('you_coder_id', $userId)->exists()) {
            return response()->json(['message' => 'Already joined'], 409);
        }

        $ivent->attendees()->attach($userId, ['joined_at' => now()]);
        return response()->json(['message' => 'Joined event']);
    }

    public function leave(Ivents $ivent)
    {
        $userId = request()->user()->id;
        $ivent->attendees()->detach($userId);
        return response()->json(['message' => 'Left event']);
    }
}
