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

    public function youCoder()
    {
        return $this->belongsTo(User::class, 'you_coder_id');
    }

    public function answers()
    {
        return $this->hasMany(Answers::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'question_tag');
    }

    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

}
