<?php

namespace App\Models;

use App\Enums\QuestionStatus;
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
        return $this->hasMany(Answers::class , 'question_id');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'question_tag' , 'question_id' , 'tag_id');
    }

    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }


    protected $casts = [
        'you_coder_id' => 'integer',
        'answers_count' => 'integer',
        'status' => QuestionStatus::class,
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

}
