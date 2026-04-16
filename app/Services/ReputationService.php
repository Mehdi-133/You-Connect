<?php

namespace App\Services;

use App\Enums\ReputationReason;
use App\Models\Reputation;
use App\Models\User;

class ReputationService
{
    public function apply(User $user, ReputationReason $reason): Reputation
    {
        $points = $reason->points();

        $reputation = Reputation::create([
            'you_coder_id' => $user->id,
            'points' => $points,
            'reason' => $reason->value,
        ]);

        $user->increment('reputation', $points);

        return $reputation;
    }
}
