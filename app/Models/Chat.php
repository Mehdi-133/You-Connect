<?php

namespace App\Models;

use App\Enums\ChatType;
use Database\Factories\ChatFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'club_id',
    ];

    public function club()
    {
        return $this->belongsTo(Club::class);
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'chat_user', 'chat_id', 'you_coder_id')
            ->withPivot('joined_at', 'last_read_at');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    protected $casts = [
        'club_id' => 'integer',
        'type' => ChatType::class,
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
