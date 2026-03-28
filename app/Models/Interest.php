<?php

namespace App\Models;

use App\Enums\InterestType;
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
        return $this->belongsToMany(User::class, 'interest_user')
            ->withPivot('selected_at');
    }

    protected $casts = [
        'type'       => InterestType::class,
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];


}
