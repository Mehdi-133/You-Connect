<?php

namespace Database\Seeders;

use App\Enums\BlogStatus;
use App\Enums\IventStatus;
use App\Enums\InterestType;
use App\Enums\NotificationType;
use App\Enums\UserRole;
use App\Enums\YouCoderStatus;
use App\Models\Badge;
use App\Models\Blog;
use App\Models\Club;
use App\Models\Interest;
use App\Models\Ivents;
use App\Models\Notification;
use App\Models\Questions;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DashboardDemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = $this->upsertUser([
            'name' => 'Admin',
            'email' => 'admin@youconnect.com',
            'role' => UserRole::Admin,
            'bio' => 'Administrator account',
            'reputation' => 2200,
        ]);

        $formateur = $this->upsertUser([
            'name' => 'Formateur',
            'email' => 'formateur@youconnect.com',
            'role' => UserRole::Formateur,
            'bio' => 'Formateur account',
            'reputation' => 1680,
        ]);

        $bdeMembre = $this->upsertUser([
            'name' => 'BDE Membre',
            'email' => 'bde@youconnect.com',
            'role' => UserRole::BdeMembre,
            'bio' => 'BDE Membre account',
            'reputation' => 960,
        ]);

        $student = $this->upsertUser([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => UserRole::Student,
            'bio' => 'Student dashboard demo account',
            'reputation' => 1280,
        ]);

        $studentTwo = $this->upsertUser([
            'name' => 'Amina Student',
            'email' => 'amina@example.com',
            'role' => UserRole::Student,
            'bio' => 'Frontend club member',
            'reputation' => 420,
        ]);

        $studentThree = $this->upsertUser([
            'name' => 'Yassine Student',
            'email' => 'yassine@example.com',
            'role' => UserRole::Student,
            'bio' => 'Backend and API learner',
            'reputation' => 510,
        ]);

        $this->seedBadgesAndInterests($student, $studentTwo, $studentThree);
        $this->seedQuestions($student, $studentTwo, $studentThree, $formateur);
        $this->seedBlogs($student, $studentTwo, $formateur, $bdeMembre);
        $this->seedNotifications($admin, $formateur, $bdeMembre, $student);
        $this->seedClubs($bdeMembre, $student, $studentTwo, $studentThree);
        $this->seedEvents($bdeMembre, $student, $studentTwo, $studentThree);
    }

    private function upsertUser(array $attributes): User
    {
        return User::updateOrCreate(
            ['email' => $attributes['email']],
            [
                'name' => $attributes['name'],
                'password' => Hash::make('password'),
                'role' => $attributes['role'],
                'status' => YouCoderStatus::Active,
                'class' => 'dev room',
                'bio' => $attributes['bio'],
                'photo' => null,
                'reputation' => $attributes['reputation'],
                'last_seen' => now(),
                'email_verified_at' => now(),
            ]
        );
    }

    private function seedBadgesAndInterests(User ...$users): void
    {
        $badges = [
            Badge::firstOrCreate(
                ['name' => 'First Solver'],
                ['description' => 'Answered a first community question.', 'icon' => 'spark-answer', 'points_required' => 100]
            ),
            Badge::firstOrCreate(
                ['name' => 'Blog Builder'],
                ['description' => 'Published an approved blog.', 'icon' => 'blog-flare', 'points_required' => 250]
            ),
            Badge::firstOrCreate(
                ['name' => 'Community Pulse'],
                ['description' => 'Stayed active in clubs and events.', 'icon' => 'pulse-ring', 'points_required' => 300]
            ),
        ];

        $interests = [
            Interest::firstOrCreate(
                ['name' => 'Frontend Builders'],
                ['type' => InterestType::WebDevelopment, 'icon' => 'frontend-builders']
            ),
            Interest::firstOrCreate(
                ['name' => 'API Design'],
                ['type' => InterestType::SoftwareArchitecture, 'icon' => 'api-design']
            ),
            Interest::firstOrCreate(
                ['name' => 'Campus Events'],
                ['type' => InterestType::Other, 'icon' => 'campus-events']
            ),
        ];

        $users[0]->badges()->syncWithoutDetaching([
            $badges[0]->id => ['awarded_at' => now()->subDays(12)],
            $badges[1]->id => ['awarded_at' => now()->subDays(7)],
        ]);
        $users[0]->interests()->syncWithoutDetaching([
            $interests[0]->id => ['selected_at' => now()->subDays(30)],
            $interests[1]->id => ['selected_at' => now()->subDays(24)],
        ]);

        $users[1]->badges()->syncWithoutDetaching([
            $badges[0]->id => ['awarded_at' => now()->subDays(18)],
        ]);
        $users[1]->interests()->syncWithoutDetaching([
            $interests[0]->id => ['selected_at' => now()->subDays(20)],
            $interests[2]->id => ['selected_at' => now()->subDays(14)],
        ]);

        $users[2]->interests()->syncWithoutDetaching([
            $interests[1]->id => ['selected_at' => now()->subDays(16)],
        ]);
    }

    private function seedQuestions(User $student, User $studentTwo, User $studentThree, User $formateur): void
    {
        $questions = [
            ['title' => 'How do I secure a Laravel Sanctum login flow?', 'author' => $student, 'status' => 'open'],
            ['title' => 'Best way to organize React feature folders?', 'author' => $studentTwo, 'status' => 'open'],
            ['title' => 'Why is my role-based dashboard not updating after login?', 'author' => $studentThree, 'status' => 'open'],
            ['title' => 'How can I seed clubs and events for local testing?', 'author' => $student, 'status' => 'open'],
            ['title' => 'Debugging pending blog approvals in Laravel', 'author' => $formateur, 'status' => 'closed'],
        ];

        foreach ($questions as $index => $item) {
            Questions::updateOrCreate(
                ['slug' => Str::slug($item['title']) . '-demo'],
                [
                    'you_coder_id' => $item['author']->id,
                    'title' => $item['title'],
                    'content' => 'Demo seeded question content for the dashboard.',
                    'slug' => Str::slug($item['title']) . '-demo',
                    'status' => $item['status'],
                    'answers_count' => $index + 1,
                ]
            );
        }
    }

    private function seedBlogs(User $student, User $studentTwo, User $formateur, User $bdeMembre): void
    {
        $blogs = [
            ['title' => 'Building a role-aware dashboard in React', 'author' => $student, 'status' => BlogStatus::Approved, 'like_count' => 6],
            ['title' => 'How we review student blogs efficiently', 'author' => $formateur, 'status' => BlogStatus::Pending, 'like_count' => 1],
            ['title' => 'Launching a better campus events calendar', 'author' => $bdeMembre, 'status' => BlogStatus::Pending, 'like_count' => 0],
            ['title' => 'My first approved Laravel API write-up', 'author' => $studentTwo, 'status' => BlogStatus::Approved, 'like_count' => 4],
            ['title' => 'Pending ideas for improving club onboarding', 'author' => $bdeMembre, 'status' => BlogStatus::Pending, 'like_count' => 0],
        ];

        foreach ($blogs as $blog) {
            Blog::updateOrCreate(
                ['slug' => Str::slug($blog['title']) . '-demo'],
                [
                    'title' => $blog['title'],
                    'content' => 'Demo seeded blog content for dashboard testing.',
                    'slug' => Str::slug($blog['title']) . '-demo',
                    'status' => $blog['status'],
                    'like_count' => $blog['like_count'],
                    'is_highlighted' => $blog['status'] === BlogStatus::Approved,
                    'approved_at' => $blog['status'] === BlogStatus::Approved ? now()->subDays(3) : null,
                    'you_coder_id' => $blog['author']->id,
                ]
            );
        }
    }

    private function seedNotifications(User $admin, User $formateur, User $bdeMembre, User $student): void
    {
        $notifications = [
            [
                'recipient' => $student,
                'actor' => $formateur,
                'title' => 'Your answer was accepted',
                'type' => NotificationType::Answer,
                'content' => 'Your answer on Sanctum login flow was accepted.',
                'is_read' => false,
            ],
            [
                'recipient' => $student,
                'actor' => $admin,
                'title' => 'You received a new badge',
                'type' => NotificationType::Badge,
                'content' => 'Admin awarded you the Blog Builder badge.',
                'is_read' => false,
            ],
            [
                'recipient' => $formateur,
                'actor' => $student,
                'title' => 'New blog awaiting review',
                'type' => NotificationType::Blog,
                'content' => 'A student submitted a new blog for approval.',
                'is_read' => false,
            ],
            [
                'recipient' => $admin,
                'actor' => $formateur,
                'title' => 'Moderation report from blogs',
                'type' => NotificationType::Blog,
                'content' => 'There are several pending blogs to review.',
                'is_read' => false,
            ],
            [
                'recipient' => $bdeMembre,
                'actor' => $student,
                'title' => 'New event join request',
                'type' => NotificationType::Comment,
                'content' => 'A student interacted with the Hack Night event.',
                'is_read' => false,
            ],
        ];

        foreach ($notifications as $item) {
            Notification::updateOrCreate(
                [
                    'you_coder_id' => $item['recipient']->id,
                    'title' => $item['title'],
                ],
                [
                    'actor_id' => $item['actor']->id,
                    'type' => $item['type'],
                    'content' => $item['content'],
                    'data' => ['seeded' => true],
                    'is_read' => $item['is_read'],
                ]
            );
        }
    }

    private function seedClubs(User $bdeMembre, User $student, User $studentTwo, User $studentThree): void
    {
        $clubs = [
            [
                'name' => 'Frontend Builders',
                'description' => 'A club for UI, React, and design-driven product work.',
                'creator' => $bdeMembre,
                'members' => [$bdeMembre->id, $student->id, $studentTwo->id],
            ],
            [
                'name' => 'Robotics Crew',
                'description' => 'Students building hardware and software together.',
                'creator' => $bdeMembre,
                'members' => [$bdeMembre->id, $studentThree->id],
            ],
            [
                'name' => 'Creative Media Hub',
                'description' => 'Campus storytelling, posters, and event content.',
                'creator' => $bdeMembre,
                'members' => [$bdeMembre->id, $student->id],
            ],
        ];

        foreach ($clubs as $item) {
            $club = Club::updateOrCreate(
                ['name' => $item['name']],
                [
                    'logo' => null,
                    'description' => $item['description'],
                    'creator_id' => $item['creator']->id,
                    'is_suspended' => false,
                ]
            );

            $memberData = [];
            foreach ($item['members'] as $memberId) {
                $memberData[$memberId] = [
                    'role' => $memberId === $item['creator']->id ? 'admin' : 'member',
                    'joined_at' => now()->subDays(10),
                ];
            }

            $club->members()->syncWithoutDetaching($memberData);
        }
    }

    private function seedEvents(User $bdeMembre, User $student, User $studentTwo, User $studentThree): void
    {
        $events = [
            [
                'title' => 'Hack Night',
                'description' => 'A campus evening for rapid prototypes and team building.',
                'location' => 'Main lab',
                'starts_at' => now()->addDays(2),
                'ends_at' => now()->addDays(2)->addHours(3),
                'status' => IventStatus::Upcoming,
                'attendees' => [$student->id, $studentTwo->id],
            ],
            [
                'title' => 'React Design Jam',
                'description' => 'Design and frontend collaboration workshop.',
                'location' => 'Design room',
                'starts_at' => now()->addDays(5),
                'ends_at' => now()->addDays(5)->addHours(2),
                'status' => IventStatus::Upcoming,
                'attendees' => [$student->id, $studentThree->id],
            ],
            [
                'title' => 'Club Leaders Sync',
                'description' => 'Weekly BDE and club coordination session.',
                'location' => 'Conference room',
                'starts_at' => now()->subDay(),
                'ends_at' => now()->subDay()->addHours(1),
                'status' => IventStatus::Finished,
                'attendees' => [$studentTwo->id],
            ],
        ];

        foreach ($events as $item) {
            $event = Ivents::updateOrCreate(
                ['title' => $item['title']],
                [
                    'description' => $item['description'],
                    'location' => $item['location'],
                    'starts_at' => $item['starts_at'],
                    'ends_at' => $item['ends_at'],
                    'status' => $item['status'],
                    'you_coder_id' => $bdeMembre->id,
                ]
            );

            $attendeeData = [];
            foreach ($item['attendees'] as $attendeeId) {
                $attendeeData[$attendeeId] = ['joined_at' => now()->subDays(3)];
            }

            $event->attendees()->syncWithoutDetaching($attendeeData);
        }
    }
}
