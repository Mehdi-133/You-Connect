<?php

namespace App\Enums;

enum InterestType: string
{
    case WebDevelopment = 'web_development';
    case MobileDevelopment = 'mobile_development';
    case DataScience = 'data_science';
    case MachineLearning = 'machine_learning';
    case ArtificialIntelligence = 'artificial_intelligence';
    case CyberSecurity = 'cyber_security';
    case CloudComputing = 'cloud_computing';
    case DevOps = 'devops';
    case Blockchain = 'blockchain';
    case GameDevelopment = 'game_development';
    case Embedded = 'embedded';
    case Networking = 'networking';
    case DatabaseAdministration = 'database_administration';
    case SystemsProgramming = 'systems_programming';
    case OpenSource = 'open_source';
    case UIUXDesign = 'ui_ux_design';
    case SoftwareArchitecture = 'software_architecture';
    case Testing = 'testing';
    case Other = 'other';
}
