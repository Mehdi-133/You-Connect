<?php

namespace App\Policies;

use App\Models\Chat;
use App\Models\User;

class ChatPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Chat $chat): bool
    {
        return $chat->members()
            ->where('users.id', $user->id)
            ->exists();
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function sendMessage(User $user, Chat $chat): bool
    {
        return $chat->members()
            ->where('users.id', $user->id)
            ->exists();
    }

    public function update(User $user, Chat $chat): bool
    {
        return false;
    }

    public function delete(User $user, Chat $chat): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, Chat $chat): bool
    {
        return false;
    }

    public function forceDelete(User $user, Chat $chat): bool
    {
        return false;
    }
}
