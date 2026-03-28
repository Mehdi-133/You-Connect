<?php

namespace App\Models;

use Database\Factories\LikeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    /** @use HasFactory<LikeFactory> */
    use HasFactory;

    protected $fillable = [
        'you_coder_id',
        'blog_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'you_coder_id');
    }

    public function blog()
    {
        return $this->belongsTo(Blog::class);
    }
}
