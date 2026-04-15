function Spark({ className = '' }) {
    return (
        <div className={`pointer-events-none absolute ${className}`}>
            <div className="relative h-10 w-10">
                <span className="absolute left-1/2 top-0 h-full w-3 -translate-x-1/2 rounded-full bg-[#FFD327]" />
                <span className="absolute left-0 top-1/2 h-3 w-full -translate-y-1/2 rounded-full bg-[#FFD327]" />
            </div>
        </div>
    );
}

function FestivalWordmark() {
    return (
        <div className="relative inline-block">
            <div className="font-display leading-[0.82] [text-shadow:5px_5px_0_rgba(0,0,0,0.85)]">
                <div className="flex items-end gap-1 text-[#FFF3DC]">
                    <span className="inline-block rotate-[-12deg] text-[5.2rem] font-extrabold">Y</span>
                    <span className="inline-block rotate-[7deg] text-[5rem] font-extrabold">o</span>
                    <span className="inline-block -rotate-[9deg] text-[5rem] font-extrabold">u</span>
                </div>

                <div className="-mt-3 flex items-end gap-1">
                    <span className="inline-block rotate-[-10deg] text-[6rem] font-extrabold text-[#A34DFF]">C</span>
                    <span className="inline-block rotate-[4deg] text-[5.6rem] font-extrabold text-[#29CFFF]">o</span>
                    <span className="inline-block -rotate-[8deg] text-[5.4rem] font-extrabold text-[#FFD327]">n</span>
                    <span className="inline-block rotate-[8deg] text-[5.2rem] font-extrabold text-[#FFD327]">n</span>
                    <span className="inline-block -rotate-[12deg] text-[5rem] font-extrabold text-[#FF66D6]">e</span>
                    <span className="inline-block rotate-[9deg] text-[5.2rem] font-extrabold text-[#25F2A0]">c</span>
                    <span className="inline-block -rotate-[8deg] text-[5.2rem] font-extrabold text-[#25F2A0]">t</span>
                </div>
            </div>

            <div className="absolute -left-8 top-20 h-6 w-6 rounded-full bg-[#FFD327] shadow-[3px_3px_0_rgba(0,0,0,0.8)]" />
            <div className="absolute left-10 top-32 h-4 w-4 rounded-full bg-[#29CFFF] shadow-[3px_3px_0_rgba(0,0,0,0.8)]" />
            <div className="absolute right-8 top-10 h-5 w-5 rounded-full bg-[#FFD327] shadow-[3px_3px_0_rgba(0,0,0,0.8)]" />
            <div className="absolute -right-4 bottom-8 h-6 w-6 rounded-full bg-[#FF66D6] shadow-[3px_3px_0_rgba(0,0,0,0.8)]" />
        </div>
    );
}

export function SignInPage() {
    return (
        <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12">
            <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="surface festival-card hero-gradient relative hidden overflow-hidden rounded-[2.8rem] p-10 lg:block">
                    <Spark className="right-10 top-10 rotate-[18deg] scale-75" />
                    <Spark className="left-12 top-36 -rotate-[14deg] scale-50" />
                    <div className="absolute inset-x-12 bottom-12 h-40 rounded-[3rem] bg-[radial-gradient(circle_at_center,rgba(163,77,255,0.22),transparent_58%)] blur-[40px]" />

                    <span className="inline-flex rounded-full bg-[#FFD327] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                        Enter the club
                    </span>

                    <div className="relative mt-8 min-h-[520px]">
                        <div className="max-w-[650px]">
                            <FestivalWordmark />

                            <p className="mt-10 max-w-xl text-[1.1rem] leading-9 text-[#d8cfbd]">
                                Jump back into questions, blogs, badges, and community challenges from the same vivid learning space.
                            </p>
                            <div className="mt-12 flex flex-wrap gap-3">
                                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#29CFFF] shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                                    Student access
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#FFD327] shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                                    Formateur tools
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#FF66D6] shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                                    Admin controls
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="surface festival-card relative mx-auto w-full max-w-xl overflow-hidden rounded-[2.8rem] p-8 md:p-10">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(41,207,255,0.16),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(255,211,39,0.14),transparent_45%)]" />

                    <p className="relative inline-flex rounded-full bg-[#FFD327] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                        Authentication
                    </p>
                    <h1 className="relative mt-6 font-display text-6xl font-extrabold leading-none text-[#FFF3DC]">Welcome back</h1>
                    <p className="relative mt-4 max-w-lg text-base leading-8 text-[rgb(var(--fg-muted))]">
                        Sign in to continue testing the real UI shell before we wire it to Laravel Sanctum.
                    </p>

                    <div className="relative mt-10 grid gap-4">
                        <input className="festival-card rounded-[1.7rem] border border-[rgb(var(--line))] bg-[rgb(var(--bg-panel))] px-5 py-4 text-lg outline-none placeholder:text-[rgb(var(--fg-muted))]" placeholder="Email" />
                        <input className="festival-card rounded-[1.7rem] border border-[rgb(var(--line))] bg-[rgb(var(--bg-panel))] px-5 py-4 text-lg outline-none placeholder:text-[rgb(var(--fg-muted))]" placeholder="Password" type="password" />
                        <button className="festival-card rounded-[1.8rem] border-2 border-black bg-[linear-gradient(90deg,#8B5CF6_0%,#29CFFF_34%,#25F2A0_70%,#D9F542_100%)] px-5 py-4 font-black uppercase tracking-[0.24em] text-black">
                            Continue
                        </button>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                        <span className="rounded-full border border-[rgb(var(--line))] bg-white/5 px-4 py-2">Student access</span>
                        <span className="rounded-full border border-[rgb(var(--line))] bg-white/5 px-4 py-2">Formateur space</span>
                        <span className="rounded-full border border-[rgb(var(--line))] bg-white/5 px-4 py-2">Admin tools</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
