<?php

namespace App\Policies;

use App\Models\Answers;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AnswersPolicy
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
    public function view(User $user, Answers $answers): bool
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
    public function update(User $user, Answers $answers): bool
    {
        return $user->id === $answers->you_coder_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Answers $answers): bool
    {
        return $user->id === $answers->you_coder_id;
    }

    public function suspend(User $user, Answers $answers): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Answers $answers): bool
    {
        return $user->isAdmin();
    }

    public function highlight(User $user, Answers $answers): bool
    {
        return $user->isFormateur() || $user->isAdmin();
    }

    //here we gonnna make only the user whos ask a question that he can accept a question or formateur too
    public function accept(User $user, Answers $answers): bool
    {
        return  $user->id === $answers->question->you_coder_id || $user->isFormateur();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Answers $answers): bool
    {
        return false;
    }
}
