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

enum InterestType: string
{
    case WebDevelopment       = 'web_development';
    case MobileDevelopment    = 'mobile_development';
    case DataScience          = 'data_science';
    case MachineLearning      = 'machine_learning';
    case ArtificialIntelligence = 'artificial_intelligence';
    case CyberSecurity        = 'cyber_security';
    case CloudComputing       = 'cloud_computing';
    case DevOps               = 'devops';
    case Blockchain           = 'blockchain';
    case GameDevelopment      = 'game_development';
    case Embedded             = 'embedded';
    case Networking           = 'networking';
    case DatabaseAdministration = 'database_administration';
    case SystemsProgramming   = 'systems_programming';
    case OpenSource           = 'open_source';
    case UIUXDesign           = 'ui_ux_design';
    case SoftwareArchitecture = 'software_architecture';
    case Testing              = 'testing';
    case Other                = 'other';
}
