<?php

namespace App\Models;

use App\Enums\InterestType;
use Database\Factories\InterestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Interest extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'icon',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'interest_user', 'interest_id', 'you_coder_id')
            ->withPivot('selected_at');
    }

    protected $casts = [
        'type' => InterestType::class,
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
