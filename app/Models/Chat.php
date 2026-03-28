<?php

namespace App\Models;

use Database\Factories\ChatFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    /** @use HasFactory<ChatFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'club_id'
    ];


    public function club()
    {
        return $this->belongsTo(Club::class);
    }

    public function Engaged()
    {
        return $this->belongsToMany(User::class, 'chat_you_coder')
            ->withPivot('joined_at', 'last_read_at');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }


}
