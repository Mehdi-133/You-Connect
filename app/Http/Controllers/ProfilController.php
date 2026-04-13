<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfilController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', User::class);
        return User::select('id', 'name', 'photo', 'bio', 'reputation', 'role', 'status', 'last_seen')
            ->latest()->paginate(10);
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);
        return $user->load(['badges', 'interests']);
    }

    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $request->validate([
            'name'  => 'sometimes|string|max:255',
            'bio'   => 'sometimes|string',
            'class' => 'sometimes|in:dev room,dar hamza',
            'photo' => 'sometimes|string',
        ]);

        $user->update($request->only(['name', 'bio', 'class', 'photo']));
        return response()->json($user);
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);
        $user->delete();
        return response()->json(['message' => 'Account deleted']);
    }

    public function banned(User $user)
    {
        $this->authorize('banned', $user);
        $user->update(['status' => 'banned']);
        return response()->json(['message' => 'User banned']);
    }

    public function restore(User $user)
    {
        $this->authorize('restore', $user);
        $user->update(['status' => 'active']);
        return response()->json(['message' => 'User restored']);
    }

    public function changeRole(Request $request, User $user)
    {
        $this->authorize('changeRole', $user);

        $request->validate([
            'role' => 'required|in:visitor,student,bde_membre,formateur,admin',
        ]);

        $user->update(['role' => $request->input('role')]);
        return response()->json(['message' => 'Role updated', 'role' => $user->role]);
    }
}
