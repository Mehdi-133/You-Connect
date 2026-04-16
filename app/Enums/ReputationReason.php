<?php

namespace App\Enums;

enum ReputationReason: string
{
    case AnswerAccepted = 'answer_accepted';
    case AnswerUpvoted = 'answer_upvoted';
    case AnswerDownvoted = 'answer_downvoted';
    case BlogApproved = 'blog_approved';
    case BlogLiked = 'blog_liked';

    public function points(): int
    {
        return match ($this) {
            self::AnswerAccepted => 15,
            self::AnswerUpvoted => 10,
            self::AnswerDownvoted => -2,
            self::BlogApproved => 20,
            self::BlogLiked => 3,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::AnswerAccepted => 'Answer accepted',
            self::AnswerUpvoted => 'Answer upvoted',
            self::AnswerDownvoted => 'Answer downvoted',
            self::BlogApproved => 'Blog approved',
            self::BlogLiked => 'Blog liked',
        };
    }
}
