<?php

namespace App\Models;

use App\Enums\NotificationType;
use Database\Factories\NotificationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'actor_id',
        'title',
        'type',
        'content',
        'data',
        'is_read',
        'you_coder_id',
    ];

    public function recipient()
    {
        return $this->belongsTo(User::class, 'you_coder_id');
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    protected $casts = [
        'actor_id' => 'integer',
        'you_coder_id' => 'integer',
        'is_read'      => 'boolean',
        'type'         => NotificationType::class,
        'data'         => 'array',
        'created_at'   => 'datetime',
        'updated_at'   => 'datetime',
    ];
}
