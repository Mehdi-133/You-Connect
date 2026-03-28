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


    public function question()
    {
        return $this->belongsTo(Questions::class);
    }

    public function youCoder()
    {
        return $this->belongsTo(User::class, 'you_coder_id');
    }

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }

    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    protected $casts = [
        'question_id' => 'integer',
        'you_coder_id' => 'integer',
        'is_accepted' => 'boolean',
        'vote_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}


