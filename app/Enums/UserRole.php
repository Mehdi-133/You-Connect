<?php

namespace App\Enums;

enum UserRole: string
{
    case Visitor = 'visitor';
    case Student = 'student';
    case BdeMembre = 'bde_membre';
    case Formateur = 'formateur';
    case Admin = 'admin';

    // check if this role has at least the given role's permissions
    public function isAtLeast(self $role): bool
    {
        $hierarchy = [
            self::Visitor => 0,
            self::Student => 1,
            self::BdeMembre => 2,
            self::Formateur => 2,
            self::Admin => 3,
        ];

        return $hierarchy[$this] >= $hierarchy[$role];
    }

    // human readable label for API responses
    public function label(): string
    {
        return match ($this) {
            self::Visitor => 'Visitor',
            self::Student => 'Student',
            self::BdeMembre => 'BDE Membre',
            self::Formateur => 'Formateur',
            self::Admin => 'Admin',
        };
    }
}
