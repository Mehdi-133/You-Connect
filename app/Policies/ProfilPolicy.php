<?php

namespace App\Policies;

use App\Models\Badge;
use App\Models\User;

class ProfilPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, User $model): bool
    {
        return true;
    }

    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id;
    }

    public function delete(User $user, User $model): bool
    {
        return $user->id === $model->id;
    }

    public function banned(User $user, User $model): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, User $model): bool
    {
        return $user->isAdmin();
    }

    public function changeRole(User $user): bool
    {
        return $user->isAdmin();
    }

    public function assignBadge(User $user, User $model, Badge $badge): bool
    {
        return $user->isAdmin();
    }

    public function revokeBadge(User $user, User $model, Badge $badge): bool
    {
        return $user->isAdmin();
    }

    public function forceDelete(User $user, User $model): bool
    {
        return false;
    }
}
