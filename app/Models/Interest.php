<?php

namespace App\Models;

use Database\Factories\InterestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Interest extends Model
{
    /** @use HasFactory<InterestFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'icon',
    ];

    public function youCoder()
    {
        return $this->belongsToMany(User::class, 'interest_you_coder')
            ->withPivot('selected_at');
    }
}
