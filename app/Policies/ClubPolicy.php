<?php

namespace App\Policies;

use App\Models\Club;
use App\Models\User;

class ClubPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Club $club): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isFormateur();
    }

    public function update(User $user, Club $club): bool
    {
        return $user->id === $club->creator_id;
    }

    public function delete(User $user, Club $club): bool
    {
        return $user->id === $club->creator_id || $user->isAdmin();
    }

    public function suspend(User $user, Club $club): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, Club $club): bool
    {
        return $user->isAdmin();
    }

    public function manageMember(User $user, Club $club): bool
    {
        return $user->id === $club->creator_id || $user->isAdmin();
    }

    public function forceDelete(User $user, Club $club): bool
    {
        return false;
    }
}
