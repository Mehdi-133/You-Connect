import { SectionCard } from '../../../shared/components/SectionCard';

const notificationItems = [
    { type: 'Answer', title: 'Your answer was accepted', tone: 'bg-brand-mint/15' },
    { type: 'Vote', title: 'New upvote on your answer', tone: 'bg-brand-cyan/15' },
    { type: 'Blog', title: 'Your blog was approved', tone: 'bg-brand-violet/15' },
];

export function NotificationsPage() {
    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Notifications"
                title="Rewarding, readable, and loud enough"
                description="This center reflects the backend notification flows you already built, but now with the same celebratory visual tone as the landing page."
                className="hero-gradient"
            >
                <div className="flex flex-wrap gap-3">
                    {['All', 'Answers', 'Votes', 'Blogs', 'Comments'].map((item, index) => (
                        <span
                            key={item}
                            className={[
                                'festival-card rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.14em]',
                                index === 0 ? 'bg-[#FF66D6] text-black' : 'bg-white/70 text-black dark:bg-white/10 dark:text-[rgb(var(--fg))]',
                            ].join(' ')}
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </SectionCard>

            <div className="grid gap-4">
                {notificationItems.map((item) => (
                    <div key={item.title} className={`surface festival-card rounded-[2rem] p-5 ${item.tone}`}>
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-[rgb(var(--fg-muted))]">{item.type}</p>
                            <span className="rounded-full bg-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white dark:bg-white dark:text-black">
                                New
                            </span>
                        </div>
                        <p className="mt-3 font-display text-2xl font-extrabold leading-none">{item.title}</p>
                        <p className="mt-3 text-sm leading-7 text-[rgb(var(--fg-muted))]">
                            This module is ready to connect to your real notification endpoint and support grouped filters next.
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
