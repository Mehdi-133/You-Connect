<?php

namespace App\Policies;

use App\Models\Ivents;
use App\Models\User;

class IventsPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Ivents $ivents): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isBdeMembre();
    }

    public function update(User $user, Ivents $ivents): bool
    {
        return $user->id === $ivents->you_coder_id;
    }

    public function delete(User $user, Ivents $ivents): bool
    {
        return $user->id === $ivents->you_coder_id || $user->isAdmin();
    }

    public function cancel(User $user, Ivents $ivents): bool
    {
        return $user->id === $ivents->you_coder_id;
    }

    public function suspend(User $user, Ivents $ivents): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, Ivents $ivents): bool
    {
        return $user->isAdmin();
    }

    public function join(User $user, Ivents $ivents): bool
    {
        return $user->isStudent() || $user->isFormateur();
    }

    public function forceDelete(User $user, Ivents $ivents): bool
    {
        return false;
    }
}
