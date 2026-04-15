<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Enums\NotificationType;
use App\Services\NotificationService;
use App\Models\Interest;


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

    public function assignBadge(User $user, Badge $badge, NotificationService $notificationService)
    {
        $this->authorize('assignBadge', [$user, $badge]);

        if ($user->badges()->where('badges.id', $badge->id)->exists()) {
            return response()->json([
                'message' => 'User already has this badge',
            ], 409);
        }

        $user->badges()->attach($badge->id, [
            'awarded_at' => now(),
        ]);

        if (request()->user()->id !== $user->id) {
            $notificationService->send(
                recipient: $user,
                type: NotificationType::Badge,
                title: 'You received a new badge',
                content: request()->user()->name . " awarded you the badge: {$badge->name}",
                actor: request()->user(),
                data: [
                    'badge_id' => $badge->id,
                    'badge_name' => $badge->name,
                    'action' => 'awarded',
                ],
            );
        }

        return response()->json([
            'message' => 'Badge assigned successfully',
            'badge' => $badge,
        ], 201);
    }


    public function revokeBadge(User $user, Badge $badge)
    {
        $this->authorize('revokeBadge', [$user, $badge]);

        if (!$user->badges()->where('badges.id', $badge->id)->exists()) {
            return response()->json([
                'message' => 'User does not have this badge',
            ], 404);
        }

        $user->badges()->detach($badge->id);

        return response()->json([
            'message' => 'Badge revoked successfully',
        ]);
    }


    //selecting interests

    public function addInterest(User $user, Interest $interest)
    {
        if (request()->user()->id !== $user->id && !request()->user()->isAdmin()) {
            return response()->json([
                'message' => 'You do not have permission to perform this action.',
            ], 403);
        }

        if ($user->interests()->where('interests.id', $interest->id)->exists()) {
            return response()->json([
                'message' => 'User already has this interest',
            ], 409);
        }

        $user->interests()->attach($interest->id, [
            'selected_at' => now(),
        ]);

        return response()->json([
            'message' => 'Interest added successfully',
            'interest' => $interest,
        ], 201);
    }

    public function removeInterest(User $user, Interest $interest)
    {
        if (request()->user()->id !== $user->id && !request()->user()->isAdmin()) {
            return response()->json([
                'message' => 'You do not have permission to perform this action.',
            ], 403);
        }

        if (!$user->interests()->where('interests.id', $interest->id)->exists()) {
            return response()->json([
                'message' => 'User does not have this interest',
            ], 404);
        }

        $user->interests()->detach($interest->id);

        return response()->json([
            'message' => 'Interest removed successfully',
        ]);
    }
}
