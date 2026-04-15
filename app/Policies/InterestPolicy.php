<?php

namespace App\Policies;

use App\Models\Interest;
use App\Models\User;

class InterestPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Interest $interest): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Interest $interest): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Interest $interest): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, Interest $interest): bool
    {
        return false;
    }

    public function forceDelete(User $user, Interest $interest): bool
    {
        return false;
    }
}
