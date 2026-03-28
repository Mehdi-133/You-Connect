<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'role',
        'password',
        'class',
        'bio',
        'photo',
        'reputation',
        'status',
        'last_seen'
    ];


    public function blogs()
    {
        return $this->hasMany(Blog::class);
    }

    public function questions()
    {
        return $this->hasMany(Questions::class);
    }

    public function answers()
    {
        return $this->hasMany(Answers::class);
    }

    public function vote()
    {
        return $this->hasMany(Vote::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function reputation()
    {
        return $this->hasMany(Reputation::class);
    }

    public function club()
    {
        return $this->hasMany(Club::class, 'creator_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function Badge()
    {
        return $this->belongsToMany(Badge::class, 'badge_you_coder')
            ->withPivot('awarded_at')
            ->withTimestamps();

    }

    public function interests()
    {
        return $this->belongsToMany(Interest::class, 'interest_you_coder')
            ->withPivot('selected_at')
            ->withTimestamps();

    }

    public function clubs()
    {
        return $this->belongsToMany(Club::class, 'club_you_coder')
            ->withPivot('role', 'joined_at');
    }

    public function chat()
    {
        return $this->belongsToMany(Chat::class, 'chat_you_coder')
            ->withPivot('joined_at', 'last_read_at');
    }


    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected
        $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected
    function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
