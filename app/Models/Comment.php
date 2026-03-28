<?php

namespace App\Models;

use Database\Factories\CommentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    /** @use HasFactory<CommentFactory> */
    use HasFactory;

    protected $fillable = [
        'content',
        'you_coder_id',
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

    protected $casts = [
        'you_coder_id' => 'integer',
        'commentable_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}
