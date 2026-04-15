function MiniSpark({ className = '' }) {
    return (
        <div className={`pointer-events-none absolute ${className}`}>
            <div className="relative h-8 w-8">
                <span className="absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 rounded-full bg-[#25F2A0]" />
                <span className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-[#25F2A0]" />
            </div>
        </div>
    );
}

export function SignUpPage() {
    return (
        <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12">
            <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="surface festival-card relative mx-auto w-full max-w-xl overflow-hidden rounded-[2.8rem] p-8 md:p-10">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(37,242,160,0.16),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(255,102,214,0.14),transparent_45%)]" />

                    <p className="relative inline-flex rounded-full bg-[#25F2A0] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                        Create account
                    </p>
                    <h1 className="relative mt-6 font-display text-6xl font-extrabold leading-none text-[#FFF3DC]">Join YouConnect</h1>
                    <p className="relative mt-4 max-w-lg text-base leading-8 text-[rgb(var(--fg-muted))]">
                        Build your profile, ask better questions, publish blogs, and grow through contribution-based learning.
                    </p>

                    <div className="relative mt-10 grid gap-4">
                        <input className="festival-card rounded-[1.7rem] border border-[rgb(var(--line))] bg-[rgb(var(--bg-panel))] px-5 py-4 text-lg outline-none placeholder:text-[rgb(var(--fg-muted))]" placeholder="Full name" />
                        <input className="festival-card rounded-[1.7rem] border border-[rgb(var(--line))] bg-[rgb(var(--bg-panel))] px-5 py-4 text-lg outline-none placeholder:text-[rgb(var(--fg-muted))]" placeholder="Email" />
                        <input className="festival-card rounded-[1.7rem] border border-[rgb(var(--line))] bg-[rgb(var(--bg-panel))] px-5 py-4 text-lg outline-none placeholder:text-[rgb(var(--fg-muted))]" placeholder="Password" type="password" />
                        <button className="festival-card rounded-[1.8rem] border-2 border-black bg-[linear-gradient(90deg,#25F2A0_0%,#29CFFF_35%,#A34DFF_70%,#FFD327_100%)] px-5 py-4 font-black uppercase tracking-[0.24em] text-black">
                            Create account
                        </button>
                    </div>
                </div>

                <div className="surface festival-card hero-gradient relative hidden overflow-hidden rounded-[2.8rem] p-10 lg:block">
                    <MiniSpark className="right-12 top-12 rotate-[10deg]" />
                    <MiniSpark className="left-16 top-44 -rotate-[18deg] scale-75" />

                    <span className="inline-flex rounded-full bg-[#FF66D6] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                        Community perks
                    </span>
                    <h2 className="mt-8 max-w-4xl font-display text-[5.1rem] font-extrabold leading-[0.9] tracking-tight">
                        <span className="text-[#FFF3DC]">Earn</span>{' '}
                        <span className="text-[#FFD327]">your</span>
                        <br />
                        <span className="text-[#29CFFF]">place</span>{' '}
                        <span className="text-[#25F2A0]">in</span>{' '}
                        <span className="text-[#FF66D6]">the feed.</span>
                    </h2>
                    <div className="mt-10 grid gap-4">
                        {[
                            ['Ask technical questions and get fast peer support.', 'bg-[#FFD327]'],
                            ['Publish blogs and get approved by formateurs.', 'bg-[#29CFFF]'],
                            ['Unlock badges, streaks, and reputation over time.', 'bg-[#25F2A0]'],
                        ].map(([item, tone], index) => (
                            <div
                                key={item}
                                className={`${tone} festival-card rounded-[1.9rem] border-2 p-5 text-black ${
                                    index === 1 ? 'translate-x-4' : index === 2 ? '-translate-x-2' : ''
                                }`}
                            >
                                <p className="text-sm font-black uppercase tracking-[0.16em]">Feature {index + 1}</p>
                                <p className="mt-3 text-base font-semibold leading-7">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
