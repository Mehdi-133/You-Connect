<?php

namespace App\Models;

use Database\Factories\QuestionsFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Questions extends Model
{
    /** @use HasFactory<QuestionsFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'slug',
        'status',
        'answers_count',
        'you_coder_id'
    ];

}
