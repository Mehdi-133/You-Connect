<?php

namespace App\Models;

use App\Enums\MessageType;
use Database\Factories\MessageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    /** @use HasFactory<MessageFactory> */
    use HasFactory;

    protected $fillable = [
        'content',
        'type',
        'is_read',
        'chat_id',
        'you_coder_id',
    ];

    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    public function YouCoder()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    protected $casts = [
        'chat_id' => 'integer',
        'sender_id' => 'integer',
        'is_read' => 'boolean',
        'type' => MessageType::class,
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}
