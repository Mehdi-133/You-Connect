<?php

namespace App\Models;

use Database\Factories\BadgeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    /** @use HasFactory<BadgeFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'icon',
        'points_required',
        'you_coder_id'
    ];

    public function youCoders()
    {
        return $this->belongsToMany(User::class, 'badge_you_coder')
            ->withPivot('awarded_at');
    }

    protected $casts = [
        'points_required' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
