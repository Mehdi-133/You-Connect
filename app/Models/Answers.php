<?php

namespace App\Models;

use Database\Factories\AnswersFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answers extends Model
{
    /** @use HasFactory<AnswersFactory> */
    use HasFactory;

    protected $fillable = [
        'content',
        'is_accepted',
        'vote_count',
        'question_id',
        'you_coder_id',
    ];
}
