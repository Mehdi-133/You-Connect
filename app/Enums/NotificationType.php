<?php

namespace App\Enums;

enum NotificationType: string
{
    case Answer = 'answer';
    case Blog = 'blog';
    case Message = 'message';
    case Badge = 'badge';
    case Mention = 'mention';
    case Comment = 'comment';
}
