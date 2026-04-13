<?php

namespace App\Enums;

enum VoteType: string
{
    case UpVote = 'upVote';
    case DownVote = 'downVote';
}
