<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use App\Enums\Campus;
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
        'campus',
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
        return $this->belongsToMany(Badge::class, 'badge_user', 'you_coder_id', 'badge_id')
            ->withPivot('awarded_at');
    }

    public function interests()
    {
        return $this->belongsToMany(Interest::class, 'interest_user', 'you_coder_id', 'interest_id')
            ->withPivot('selected_at');
    }

    public function clubs()
    {
        return $this->belongsToMany(Club::class, 'club_user', 'you_coder_id', 'club_id')
            ->withPivot('role', 'joined_at');
    }

    public function chats()
    {
        return $this->belongsToMany(Chat::class, 'chat_user', 'you_coder_id', 'chat_id')
            ->withPivot('joined_at', 'last_read_at');
    }


    //helpers for roles

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isFormateur(): bool
    {
        return $this->role === UserRole::Formateur;
    }

    public function isBdeMembre(): bool
    {
        return $this->role === UserRole::BdeMembre;
    }

    public function isStudent(): bool
    {
        return $this->role->isAtLeast(UserRole::Student);
    }

    public function isVisitor(): bool
    {
        return $this->role === UserRole::Visitor;
    }

    //status hellper for blocking suspended user

    public function canAccess(): bool
    {
        return $this->status->canAccess();
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
            'role' => UserRole::class,
            'campus' => Campus::class,
            'last_seen' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
