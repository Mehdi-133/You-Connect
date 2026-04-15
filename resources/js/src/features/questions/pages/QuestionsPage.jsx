import { SectionCard } from '../../../shared/components/SectionCard';

export function QuestionsPage() {
    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow="Questions"
                title="Question feed with poster energy"
                description="This screen now follows the same loud, layered visual language as the landing page while keeping the reading flow clear."
                className="hero-gradient"
            >
                <div className="flex flex-wrap gap-3">
                    {['All topics', 'React', 'Laravel', 'Notifications', 'UX'].map((item, index) => (
                        <button
                            key={item}
                            className={[
                                'festival-card rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.14em]',
                                index === 0 ? 'bg-[#FFD327] text-black' : 'bg-white/70 text-black dark:bg-white/10 dark:text-[rgb(var(--fg))]',
                            ].join(' ')}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </SectionCard>

            <div className="grid gap-4">
                {[
                    ['How should we model notification UX in React?', '#29CFFF', '4 answers', 'Accepted answer expected'],
                    ['What is the cleanest way to structure protected routes?', '#25F2A0', '7 answers', 'High activity'],
                    ['Should comments use optimistic UI or server sync first?', '#FF66D6', '2 answers', 'Needs review'],
                ].map(([title, color, answers, status]) => (
                    <article key={title} className="surface festival-card rounded-[2rem] p-5">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="h-3 w-20 rounded-full" style={{ backgroundColor: color }} />
                            <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                                {answers}
                            </span>
                            <span className="rounded-full border border-[rgb(var(--line))] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                                {status}
                            </span>
                        </div>
                        <p className="mt-4 font-display text-3xl font-extrabold leading-none">{title}</p>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-[rgb(var(--fg-muted))]">
                            These cards are tuned to feel more like collectible knowledge tiles than plain forum rows, while staying readable for long-form technical content.
                        </p>
                    </article>
                ))}
            </div>
        </div>
    );
}
