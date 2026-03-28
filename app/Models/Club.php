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
        'you_coder_id',
    ];

    public function youCoder()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'club_you_coder')
            ->withPivot('role', 'joined_at');
    }

    public function chats()
    {
        return $this->hasMany(Chat::class);
    }
}
