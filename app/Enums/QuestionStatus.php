<?php

namespace App\Enums;

enum QuestionStatus: string
{
    case Open = 'open';
    case Solved = 'solved';
    case Closed = 'closed';
}
