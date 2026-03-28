<?php

namespace App\Models;

use App\Enums\BlogStatus;
use Database\Factories\BlogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    /** @use HasFactory<BlogFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'slug',
        'status',
        'like_count',
        'approved_at',
        'you_coder_id'
    ];


    public function youCoder()
    {
        return $this->belongsTo(User::class, 'you_coder_id');
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');

    }


    protected $casts = [
        'you_coder_id' => 'integer',
        'like_count' => 'integer',
        'status' => BlogStatus::class,
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];


}

