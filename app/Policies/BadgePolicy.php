<?php

namespace App\Policies;

use App\Models\Badge;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class BadgePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Badge $badge): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Badge $badge): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Badge $badge): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, Badge $badge): bool
    {
        return false;
    }

    public function forceDelete(User $user, Badge $badge): bool
    {
        return false;
    }
}
