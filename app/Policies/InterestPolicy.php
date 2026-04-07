<?php

namespace App\Policies;

use App\Models\Interest;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class InterestPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Interest $interest): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Interest $interest): bool
    {
        return $user->isAdmin() || $user->id === $interest->you_coder_id;

    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Interest $interest): bool
    {
        return $user->isAdmin() || $user->id === $interest->you_coder_id ;

    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Interest $interest): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Interest $interest): bool
    {
        return false;
    }
}
