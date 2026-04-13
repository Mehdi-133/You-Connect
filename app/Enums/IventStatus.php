<?php

namespace App\Enums;

enum IventStatus: string
{
    case Upcoming = 'upcoming';
    case Ongoing = 'ongoing';
    case Finished = 'finished';
    case Cancelled = 'cancelled';
    case Suspended = 'suspended';
}
