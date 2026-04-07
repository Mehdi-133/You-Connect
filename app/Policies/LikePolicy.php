<?php

namespace App\Policies;

use App\Models\Like;
use App\Models\User;
use App\Models\Blog;
use Illuminate\Auth\Access\Response;

class LikePolicy
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
    public function view(User $user, Like $like): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Blog $blog): bool
    {
        return $user->id !== $blog->you_coder_id;
    }

    /**
     * Determine whether the user can update the model.
     */

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Like $like): bool
    {
        return $user->id === $like->you_coder_id;

    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Like $like): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Like $like): bool
    {
        return false;
    }
}
