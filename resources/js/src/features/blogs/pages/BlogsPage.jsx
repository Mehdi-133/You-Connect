import { SectionCard } from '../../../shared/components/SectionCard';

export function BlogsPage() {
    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Blogs"
                title="Editorial feed with the same festival DNA"
                description="The blog area should feel poster-like and memorable, but still structured enough for serious reading and moderation."
                className="hero-gradient"
            >
                <div className="flex flex-wrap gap-3">
                    {['Featured', 'Pending', 'Approved', 'Design', 'Backend'].map((item, index) => (
                        <span
                            key={item}
                            className={[
                                'festival-card rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.14em]',
                                index === 0 ? 'bg-[#25F2A0] text-black' : 'bg-white/70 text-black dark:bg-white/10 dark:text-[rgb(var(--fg))]',
                            ].join(' ')}
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </SectionCard>

            <div className="grid gap-5 lg:grid-cols-2">
                {[
                    ['Pending review', '#FFD327', 'Designing a developer community frontend with React'],
                    ['Approved', '#29CFFF', 'How we built notifications that actually matter'],
                ].map(([status, color, title]) => (
                    <article key={title} className="surface festival-card rounded-[2rem] p-6">
                        <div className="festival-card mb-5 rounded-[1.8rem] border-2 p-10" style={{ backgroundColor: color }} />
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-[rgb(var(--fg-muted))]">{status}</p>
                            <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[rgb(var(--fg-muted))]">
                                6 min read
                            </span>
                        </div>
                        <h3 className="mt-3 font-display text-3xl font-extrabold leading-none">{title}</h3>
                        <p className="mt-3 text-sm leading-7 text-[rgb(var(--fg-muted))]">
                            A stronger editorial card with visual presence, clearer metadata, and enough structure to scale into real article previews.
                        </p>
                    </article>
                ))}
            </div>
        </div>
    );
}
