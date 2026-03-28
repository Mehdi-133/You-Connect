<?php

namespace App\Models;

use App\Enums\VoteType;
use Database\Factories\VoteFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    /** @use HasFactory<VoteFactory> */
    use HasFactory;

    protected $fillable = [
        'type',
        'you_coder_id',
        'answer_id',
    ];

    public function voter()
    {
        return $this->belongsTo(User::class, 'you_coder_id');
    }

    public function answer()
    {
        return $this->belongsTo(Answers::class);
    }

    protected $casts = [
        'you_coder_id' => 'integer',
        'answer_id' => 'integer',
        'type' => VoteType::class,
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
