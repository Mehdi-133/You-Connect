<?php

namespace App\Models;

use Database\Factories\ClubFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Club extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'logo',
        'description',
        'creator_id',
        'is_suspended',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'club_user', 'club_id', 'you_coder_id')
            ->withPivot('role', 'joined_at');
    }

    public function chats()
    {
        return $this->hasMany(Chat::class);
    }

    protected $casts = [
        'creator_id'   => 'integer',
        'is_suspended' => 'boolean',
        'created_at'   => 'datetime',
        'updated_at'   => 'datetime',
    ];
}
