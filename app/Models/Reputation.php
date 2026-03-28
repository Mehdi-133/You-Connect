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
}
