<?php

namespace App\Enums;

enum Campus: string
{
    case Nador = 'nador';
    case Safi = 'safi';
    case Youssoufia = 'youssoufia';

    public function label(): string
    {
        return match ($this) {
            self::Nador => 'Nador',
            self::Safi => 'Safi',
            self::Youssoufia => 'Youssoufia',
        };
    }
}

