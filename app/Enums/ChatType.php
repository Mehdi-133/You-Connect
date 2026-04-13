<?php

namespace App\Enums;

enum ChatType: string
{
    case Private = 'private';
    case Groupe = 'groupe';
    case Club = 'club';
    case Ai = 'ai';
}
