<?php

namespace App\Models;

use Database\Factories\ReputationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reputation extends Model
{
    /** @use HasFactory<ReputationFactory> */
    use HasFactory;

    protected $fillable = [
        'points',
        'reason',
        'you_coder_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'you_coder_id');
    }

    protected $casts = [
        'you_coder_id' => 'integer',
        'points' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
