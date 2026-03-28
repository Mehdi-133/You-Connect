<?php

namespace App\Enums;
enum YouCoderStatus: string
{
    case Active = 'active';
    case Suspended = 'suspended';
    case Banned = 'banned';
}

enum BlogStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
}

enum QuestionStatus: string
{
    case Open = 'open';
    case Solved = 'solved';
    case Closed = 'closed';
}

enum VoteType: string
{
    case UpVote = 'upVote';
    case DownVote = 'downVote';
}

// app/Enums/ClubRole.php
enum ClubRole: string
{
    case Admin = 'admin';
    case Member = 'member';
}

enum ChatType: string
{
    case Private = 'private';
    case Groupe = 'groupe';
    case Club = 'club';
    case Ai = 'ai';
}

enum MessageType: string
{
    case Text = 'text';
    case File = 'file';
    case Image = 'image';
}

enum NotificationType: string
{
    case Answer = 'answer';
    case Blog = 'blog';
    case Message = 'message';
    case Badge = 'badge';
    case Mention = 'mention';
}
