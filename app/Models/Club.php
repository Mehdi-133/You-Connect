<?php

namespace App\Models;

use Database\Factories\ClubFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Club extends Model
{
    /** @use HasFactory<ClubFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'logo',
        'description',
        'creator_id'
    ];

    public function youCoder()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'club_user')
            ->withPivot('role', 'joined_at');
    }

    public function chats()
    {
        return $this->hasMany(Chat::class);
    }

    protected $casts = [
        'creator_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
