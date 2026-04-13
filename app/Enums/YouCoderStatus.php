<?php

namespace App\Enums;

enum YouCoderStatus: string
{
    case Active = 'active';
    case Suspended = 'suspended';
    case Banned = 'banned';

    public function canAccess(): bool
    {
        return $this === self::Active;
    }
}
