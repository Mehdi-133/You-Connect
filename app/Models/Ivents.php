<?php

namespace App\Models;

use App\Enums\IventStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ivents extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'photo',
        'description',
        'location',
        'starts_at',
        'ends_at',
        'status',
        'you_coder_id',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'you_coder_id');
    }

    public function attendees()
    {
        return $this->belongsToMany(User::class, 'ivent_user', 'ivent_id', 'you_coder_id')
            ->withPivot('joined_at');
    }

    protected $casts = [
        'you_coder_id' => 'integer',
        'status'       => IventStatus::class,
        'starts_at'    => 'datetime',
        'ends_at'      => 'datetime',
        'created_at'   => 'datetime',
        'updated_at'   => 'datetime',
    ];
}
