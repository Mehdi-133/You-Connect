<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;
use function Laravel\Prompts\error;

class ProfilPolicy
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
    public function view(User $user, user $model): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, user $model): bool
    {
        return $user->id === $model->you_coder_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, user $model): bool
    {
        return $user->id === $model->you_coder_id;
    }

    public function banned(User $user, user $model): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, user $model): bool
    {
        return $user->isAdmin();
    }

    public function changeRole(User $user): bool
    {
        return $user->isAdmin();
    }


    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, user $model): bool
    {
        return false;
    }
}
