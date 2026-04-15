import { SectionCard } from '../../../shared/components/SectionCard';

export function ProfilePage() {
    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Profile"
                title="Identity, reputation, and earned proof"
                description="The profile now follows the same playful premium styling so badges and activity feel like visible progress, not plain metadata."
                className="hero-gradient"
            >
                <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                    <div className="festival-card rounded-[2rem] bg-[#0B0126] p-6 text-[#FFF3DC]">
                        <div className="mb-4 h-24 w-24 rounded-[2rem] brand-gradient" />
                        <h3 className="font-display text-3xl font-extrabold">Test User</h3>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#25F2A0]">Student • Full-stack track</p>
                        <div className="mt-6 grid gap-3">
                            {['1,280 reputation', '6-day streak', '4 badges unlocked'].map((item) => (
                                <div key={item} className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {[
                            ['Badges', '#FFD327'],
                            ['Interests', '#29CFFF'],
                            ['Activity history', '#25F2A0'],
                            ['Saved content', '#FF66D6'],
                        ].map(([item, color]) => (
                            <div key={item} className="surface festival-card rounded-[2rem] p-5">
                                <div className="mb-4 h-3 w-20 rounded-full" style={{ backgroundColor: color }} />
                                <p className="font-display text-2xl font-extrabold leading-none">{item}</p>
                                <p className="mt-3 text-sm leading-7 text-[rgb(var(--fg-muted))]">Reusable profile module placeholder.</p>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}
