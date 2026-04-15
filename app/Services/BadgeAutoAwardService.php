    <?php

    namespace App\Services;

    use App\Enums\NotificationType;
    use App\Models\User;

    class BadgeAutoAwardService
    {
        public function syncForUser(User $user, NotificationService $notificationService): void
        {
            $eligibleBadges = \App\Models\Badge::query()
                ->where('points_required', '<=', $user->reputation)
                ->get();

            foreach ($eligibleBadges as $badge) {
                $alreadyHasBadge = $user->badges()
                    ->where('badges.id', $badge->id)
                    ->exists();

                if ($alreadyHasBadge) {
                    continue;
                }

                $user->badges()->attach($badge->id, [
                    'awarded_at' => now(),
                ]);

                $notificationService->send(
                    recipient: $user,
                    type: NotificationType::Badge,
                    title: 'You unlocked a new badge',
                    content: "You earned the badge: {$badge->name}",
                    actor: null,
                    data: [
                        'badge_id' => $badge->id,
                        'badge_name' => $badge->name,
                        'action' => 'auto_awarded',
                    ],
                );
            }
        }
    }
