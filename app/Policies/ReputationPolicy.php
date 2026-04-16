<?php

namespace App\Policies;

use App\Models\Reputation;
use App\Models\User;

class ReputationPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Reputation $reputation): bool
    {
        return $user->id === $reputation->you_coder_id || $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Reputation $reputation): bool
    {
        return false;
    }

    public function delete(User $user, Reputation $reputation): bool
    {
        return false;
    }

    public function restore(User $user, Reputation $reputation): bool
    {
        return false;
    }

    public function forceDelete(User $user, Reputation $reputation): bool
    {
        return false;
    }
}
