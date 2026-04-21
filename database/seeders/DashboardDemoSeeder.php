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
            [
                'title' => 'Building a role-aware dashboard in React',
                'author' => $student,
                'status' => BlogStatus::Approved,
                'like_count' => 6,
                'photo' => 'https://picsum.photos/id/180/1200/700',
                'content' => "When your app has admins, mentors, and students, the dashboard is not just a page - it is a decision.\n\nStart by defining what each role needs to see first, then build small reusable cards that can be swapped based on role. Keep the logic close to the layout (so the UI stays honest), but keep the data fetching in one place.\n\nIn YouConnect, the biggest win is making navigation feel the same for everyone while the focus changes per role. The user should feel: \"I am in the same product, but it speaks my language.\"",
            ],
            [
                'title' => 'How we review student blogs efficiently',
                'author' => $formateur,
                'status' => BlogStatus::Pending,
                'like_count' => 1,
                'photo' => 'https://picsum.photos/id/1060/1200/700',
                'content' => "A good review flow is simple: clarity, structure, and correctness.\n\nWe scan the title and introduction first. If the reader cannot understand the goal in 10 seconds, we ask the author to tighten it. Then we check examples: are they accurate, and do they match the codebase conventions?\n\nFinally, we leave feedback in a way that teaches. A blog is not only content - it is mentorship at scale.",
            ],
            [
                'title' => 'Launching a better campus events calendar',
                'author' => $bdeMembre,
                'status' => BlogStatus::Pending,
                'like_count' => 0,
                'photo' => 'https://picsum.photos/id/1067/1200/700',
                'content' => "Campus events work when the details are easy to trust.\n\nWe want a calendar that answers three questions fast: What is happening? When is it? Where do I go? Then the \"Join\" action should be one click - no confusion, no hidden steps.\n\nIn YouConnect, events are not just announcements. They are a living part of the community, and your attendance should feel like a small commitment: \"I am showing up.\"",
            ],
            [
                'title' => 'My first approved Laravel API write-up',
                'author' => $studentTwo,
                'status' => BlogStatus::Approved,
                'like_count' => 4,
                'photo' => 'https://picsum.photos/id/1076/1200/700',
                'content' => "I used to fear APIs because I did not know where to start.\n\nThe breakthrough was learning the request path: route -> controller -> validation -> model -> response. Once you see that chain, debugging becomes much easier.\n\nNow I write endpoints like I am writing a conversation. React asks for data, Laravel answers cleanly, and the UI becomes predictable.",
            ],
            [
                'title' => 'Pending ideas for improving club onboarding',
                'author' => $bdeMembre,
                'status' => BlogStatus::Pending,
                'like_count' => 0,
                'photo' => 'https://picsum.photos/id/1059/1200/700',
                'content' => "Clubs fail when onboarding is unclear.\n\nA new member should know: what this club is for, how to contribute, and where to start. The first week matters the most. A simple pinned message and a small first task can change the entire energy.\n\nFor YouConnect, the best onboarding is: show the club story, show the people, then offer one clear action: \"Join and introduce yourself.\"",
            ],
        ];

        foreach ($blogs as $blog) {
            Blog::updateOrCreate(
                ['slug' => Str::slug($blog['title']) . '-demo'],
                [
                    'title' => $blog['title'],
                    'content' => $blog['content'],
                    'slug' => Str::slug($blog['title']) . '-demo',
                    'photo' => $blog['photo'],
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
                'logo' => 'https://picsum.photos/seed/youconnect-frontend/256/256',
                'description' => 'A club for UI, React, and design-driven product work.',
                'creator' => $bdeMembre,
                'members' => [$bdeMembre->id, $student->id, $studentTwo->id],
            ],
            [
                'name' => 'Robotics Crew',
                'logo' => 'https://picsum.photos/seed/youconnect-robotics/256/256',
                'description' => 'Students building hardware and software together.',
                'creator' => $bdeMembre,
                'members' => [$bdeMembre->id, $studentThree->id],
            ],
            [
                'name' => 'Creative Media Hub',
                'logo' => 'https://picsum.photos/seed/youconnect-media/256/256',
                'description' => 'Campus storytelling, posters, and event content.',
                'creator' => $bdeMembre,
                'members' => [$bdeMembre->id, $student->id],
            ],
        ];

        foreach ($clubs as $item) {
            $club = Club::updateOrCreate(
                ['name' => $item['name']],
                [
                    'logo' => $item['logo'],
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
                'photo' => 'https://picsum.photos/id/1039/1200/700',
                'description' => 'A campus evening for rapid prototypes and team building.',
                'location' => 'Main lab',
                'starts_at' => now()->addDays(2),
                'ends_at' => now()->addDays(2)->addHours(3),
                'status' => IventStatus::Upcoming,
                'attendees' => [$student->id, $studentTwo->id],
            ],
            [
                'title' => 'React Design Jam',
                'photo' => 'https://picsum.photos/id/1047/1200/700',
                'description' => 'Design and frontend collaboration workshop.',
                'location' => 'Design room',
                'starts_at' => now()->addDays(5),
                'ends_at' => now()->addDays(5)->addHours(2),
                'status' => IventStatus::Upcoming,
                'attendees' => [$student->id, $studentThree->id],
            ],
            [
                'title' => 'Club Leaders Sync',
                'photo' => 'https://picsum.photos/id/1011/1200/700',
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
                    'photo' => $item['photo'],
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
