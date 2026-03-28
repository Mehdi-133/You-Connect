<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Enums\YouCoderStatus;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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

    public function votes()
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

    public function reputations()
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

    public function badges()
    {
        return $this->belongsToMany(Badge::class, 'badge_user')
            ->withPivot('awarded_at');
    }

    public function interests()
    {
        return $this->belongsToMany(Interest::class, 'interest_user')
            ->withPivot('selected_at');
    }

    public function clubs()
    {
        return $this->belongsToMany(Club::class, 'club_user')
            ->withPivot('role', 'joined_at');
    }

    public function chats()
    {
        return $this->belongsToMany(Chat::class, 'chat_user')
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
            'reputation' => 'integer',
            'status' => YouCoderStatus::class,
            'last_seen' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
