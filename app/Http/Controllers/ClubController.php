<?php

namespace App\Http\Controllers;

use App\Models\Club;
use App\Http\Requests\StoreClubRequest;
use App\Http\Requests\UpdateClubRequest;
use Illuminate\Http\Request;

class ClubController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Club::class);
        return Club::with('creator:id,name,photo')
            ->withCount('members')
            ->latest()
            ->paginate(10);
    }

    public function store(StoreClubRequest $request)
    {
        $this->authorize('create', Club::class);

        $club = Club::create([
            'name'        => $request->input('name'),
            'description' => $request->input('description'),
            'logo'        => $request->input('logo'),
            'creator_id'  => $request->user()->id,
        ]);

        $club->members()->attach($request->user()->id, [
            'role'      => 'admin',
            'joined_at' => now(),
        ]);

        return response()->json($club->load('members'), 201);
    }

    public function show(Club $club)
    {
        $this->authorize('view', $club);
        return $club->load(['creator:id,name,photo', 'members:id,name,photo,bio'])
            ->loadCount('members');
    }

    public function update(UpdateClubRequest $request, Club $club)
    {
        $this->authorize('update', $club);
        $club->update($request->only(['name', 'description', 'logo']));
        return response()->json($club);
    }

    public function destroy(Club $club)
    {
        $this->authorize('delete', $club);
        $club->delete();
        return response()->json(['message' => 'Club deleted']);
    }

    public function join(Request $request, Club $club)
    {
        $userId = $request->user()->id;

        if ($club->is_suspended) {
            return response()->json(['message' => 'Club is suspended'], 403);
        }

        if ($club->members()->where('you_coder_id', $userId)->exists()) {
            return response()->json(['message' => 'Already a member'], 409);
        }

        $club->members()->attach($userId, [
            'role'      => 'member',
            'joined_at' => now(),
        ]);

        return response()->json(['message' => 'Joined club']);
    }

    public function leave(Request $request, Club $club)
    {
        $userId = $request->user()->id;

        if ($club->creator_id === $userId) {
            return response()->json(['message' => 'Creator cannot leave the club'], 403);
        }

        $club->members()->detach($userId);
        return response()->json(['message' => 'Left club']);
    }

    public function invite(Request $request, Club $club)
    {
        $this->authorize('manageMember', $club);

        $request->validate(['user_id' => 'required|integer|exists:users,id']);

        $userId = $request->input('user_id');

        if ($club->members()->where('you_coder_id', $userId)->exists()) {
            return response()->json(['message' => 'User is already a member'], 409);
        }

        $club->members()->attach($userId, [
            'role'      => 'member',
            'joined_at' => now(),
        ]);

        return response()->json(['message' => 'Member invited and added to club']);
    }

    public function removeMember(Request $request, Club $club)
    {
        $this->authorize('manageMember', $club);

        $request->validate(['user_id' => 'required|integer|exists:users,id']);

        $userId = $request->input('user_id');

        if ($club->creator_id === $userId) {
            return response()->json(['message' => 'Cannot remove the creator'], 403);
        }

        $club->members()->detach($userId);
        return response()->json(['message' => 'Member removed']);
    }

    public function changeRole(Request $request, Club $club)
    {
        $this->authorize('manageMember', $club);

        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'role'    => 'required|in:admin,member',
        ]);

        $userId = $request->input('user_id');

        if (!$club->members()->where('you_coder_id', $userId)->exists()) {
            return response()->json(['message' => 'User is not a member'], 404);
        }

        $club->members()->updateExistingPivot($userId, ['role' => $request->input('role')]);
        return response()->json(['message' => 'Member role updated']);
    }

    public function suspend(Club $club)
    {
        $this->authorize('suspend', $club);
        $club->update(['is_suspended' => true]);
        return response()->json(['message' => 'Club suspended']);
    }

    public function restore(Club $club)
    {
        $this->authorize('restore', $club);
        $club->update(['is_suspended' => false]);
        return response()->json(['message' => 'Club restored']);
    }
}
