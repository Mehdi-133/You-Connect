<?php

namespace App\Services;

use App\Enums\NotificationType;
use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    public function send(
        User $recipient,
        NotificationType $type,
        string $title,
        ?string $content = null,
        ?User $actor = null,
        array $data = [],
    ): Notification {
        return Notification::create([
            'you_coder_id' => $recipient->id,
            'actor_id' => $actor?->id,
            'type' => $type,
            'title' => $title,
            'content' => $content,
            'data' => $data,
        ]);
    }
}
