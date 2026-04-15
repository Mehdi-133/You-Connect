import { SectionCard } from '../../../shared/components/SectionCard';
import { StatCard } from '../../../shared/components/StatCard';

const statItems = [
    { label: 'Reputation', value: '1,280', hint: 'current score', accent: 'rgb(var(--brand-mint))' },
    { label: 'Unread alerts', value: '12', hint: 'notification center', accent: 'rgb(var(--brand-violet))' },
    { label: 'Questions solved', value: '34', hint: 'community impact', accent: 'rgb(var(--brand-gold))' },
];

const actionCards = [
    { title: 'Ask a question', tone: 'bg-[#29CFFF]', copy: 'Open a clean ask flow with tags, hints, and community prompts.' },
    { title: 'Write a blog', tone: 'bg-[#FFD327]', copy: 'Draft a story-driven blog card with moderation status built in.' },
    { title: 'Review alerts', tone: 'bg-[#25F2A0]', copy: 'Surface accepted answers, votes, and approvals in one place.' },
    { title: 'Join events', tone: 'bg-[#FF66D6]', copy: 'Push clubs, hackathons, and workshops with poster-like cards.' },
];

export function StudentDashboardPage() {
    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Student dashboard"
                title="Your learning arena is live."
                description="The dashboard now uses the same bold visual voice as the landing page, with stronger hierarchy for actions, reputation, and community momentum."
                className="hero-gradient overflow-hidden"
            >
                <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                    <div>
                        <div className="max-w-2xl">
                            <p className="inline-flex rounded-full bg-[#FFF3DC] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                                Daily mission
                            </p>
                            <h3 className="mt-5 font-display text-5xl font-extrabold leading-none text-gradient">
                                Answer, publish, collect proof of growth.
                            </h3>
                            <p className="mt-5 max-w-xl text-sm leading-7 text-[rgb(var(--fg-muted))]">
                                This student view should feel like a playable community dashboard, not a plain admin page.
                            </p>
                        </div>
                        <div className="mt-8 grid gap-4 md:grid-cols-2">
                            {actionCards.map((item) => (
                                <div key={item.title} className={`festival-card ${item.tone} rounded-[2rem] border-2 p-5 text-black`}>
                                    <p className="text-xs font-black uppercase tracking-[0.16em]">Quick action</p>
                                    <p className="mt-3 font-display text-3xl font-extrabold leading-none">{item.title}</p>
                                    <p className="mt-3 text-sm font-medium leading-6">{item.copy}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-1">
                        {statItems.map((item) => (
                            <StatCard key={item.label} {...item} />
                        ))}
                    </div>
                </div>
            </SectionCard>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <SectionCard
                    eyebrow="Live feed"
                    title="What students should do first"
                    description="The next round will replace this with API data, but the rhythm and visual system are now close to the final product direction."
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        {[
                            ['Frontend Builders', 'Recommended club', '#29CFFF'],
                            ['New answers on Laravel auth', 'Hot discussion', '#25F2A0'],
                            ['Write your first approved blog', 'Growth quest', '#FFD327'],
                            ['Hack Night starts at 18:00', 'Upcoming event', '#FF66D6'],
                        ].map(([item, label, color]) => (
                            <div key={item} className="festival-card rounded-[2rem] border border-[rgb(var(--line))] bg-[rgb(var(--bg-panel))] p-5">
                                <div className="mb-4 h-3 w-20 rounded-full" style={{ backgroundColor: color }} />
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">{label}</p>
                                <p className="mt-3 font-display text-2xl font-extrabold leading-none">{item}</p>
                                <p className="mt-3 text-sm leading-7 text-[rgb(var(--fg-muted))]">This card will become a reusable CTA pattern across the app.</p>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                <SectionCard
                    eyebrow="Right rail"
                    title="Progress and activity"
                    description="This rail carries the game-like progression feeling: streaks, club momentum, and earned proof."
                >
                    <div className="grid gap-4">
                        <div className="festival-card rounded-[2rem] bg-[#0B0126] p-5 text-[#FFF3DC]">
                            <p className="text-sm uppercase tracking-[0.16em] text-[#25F2A0]">Current streak</p>
                            <p className="mt-3 font-display text-4xl font-extrabold">6 days</p>
                            <div className="mt-4 h-3 rounded-full bg-white/10">
                                <div className="h-3 w-2/3 rounded-full bg-[linear-gradient(90deg,#A34DFF_0%,#29CFFF_40%,#25F2A0_100%)]" />
                            </div>
                        </div>
                        <div className="festival-card rounded-[2rem] bg-[rgb(var(--bg-panel))] p-5">
                            <p className="text-sm uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">Recommended clubs</p>
                            <ul className="mt-4 grid gap-3 text-sm">
                                <li className="rounded-full bg-white/60 px-4 py-2 font-bold text-black dark:bg-white/10 dark:text-[rgb(var(--fg))]">Frontend Builders</li>
                                <li className="rounded-full bg-white/60 px-4 py-2 font-bold text-black dark:bg-white/10 dark:text-[rgb(var(--fg))]">AI Tinker Lab</li>
                                <li className="rounded-full bg-white/60 px-4 py-2 font-bold text-black dark:bg-white/10 dark:text-[rgb(var(--fg))]">Hack Night Circle</li>
                            </ul>
                        </div>
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}
