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
        'title',
        'type',
        'content',
        'is_read',
        'you_coder_id',
    ];

    public function recipient()
    {
        return $this->belongsTo(User::class, 'you_coder_id');
    }

    protected $casts = [
        'you_coder_id' => 'integer',
        'is_read'      => 'boolean',
        'type'         => NotificationType::class,
        'created_at'   => 'datetime',
        'updated_at'   => 'datetime',
    ];
}
