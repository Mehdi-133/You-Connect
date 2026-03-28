<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    /** @use HasFactory<\Database\Factories\CommentFactory> */
    use HasFactory;

    protected $fillable = [
        'content',
        'you_coder_id',
        'blog_id',
        'commentable_id',
        'commentable_type',

    ];

    public function youCoder()
    {
        return $this->belongsTo(User::class, 'you_coder_id');
    }

    public function commentable()
    {
        return $this->morphTo();
    }
}
