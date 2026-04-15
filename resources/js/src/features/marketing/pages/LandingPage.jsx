import { Link } from 'react-router-dom';
import { YouConnectLogo } from '../../../shared/components/YouConnectLogo';

const features = [
    {
        title: 'Q&A Knowledge Hub',
        description:
            'Students ask and answer technical questions in a collaborative environment designed specifically for peer-to-peer learning.',
    },
    {
        title: 'AI Content Validation',
        description:
            'AI evaluates clarity, relevance, and similarity to ensure quality content is maintained across the platform automatically.',
    },
    {
        title: 'Technical Blogs',
        description:
            'Students publish blogs and teachers validate them for quality and accuracy, building a robust library of technical resources.',
    },
    {
        title: 'Gamified Reputation System',
        description:
            'Earn points, badges, and recognition for your contributions to the community and helping others succeed.',
    },
];

const stats = [
    { value: '3000+', label: 'Active Students' },
    { value: '5000+', label: 'Questions Answered' },
    { value: '1200+', label: 'Technical Blogs' },
    { value: '50+', label: 'Expert Mentors' },
];

const aboutCards = [
    {
        title: 'Collaboration',
        description: 'Work together to solve complex problems and build stronger technical foundations.',
        color: 'bg-[#25F2A0]',
    },
    {
        title: 'Innovation',
        description: 'Leverage AI-assisted moderation and insights to keep learning efficient and modern.',
        color: 'bg-[#FF66D6]',
    },
    {
        title: 'Growth',
        description: 'Develop your skills, earn reputation points, and prepare for your future career.',
        color: 'bg-[#FFD327]',
    },
];

function StickerButton({ children, to, variant = 'solid' }) {
    const className =
        variant === 'festival'
            ? 'border-2 border-black bg-[linear-gradient(115deg,#E27AF7_0%,#E27AF7_18%,#26F0A7_18%,#26F0A7_62%,#FFD327_62%,#FFD327_100%)] text-black hover:translate-y-[-1px]'
            : variant === 'solid'
              ? 'bg-white text-black hover:bg-[#FFD327]'
              : 'border border-white/20 bg-white/5 text-white hover:bg-white/10';

    const content = (
        <span
            className={`inline-flex min-w-[190px] justify-center rounded-full px-7 py-3 text-sm font-extrabold uppercase tracking-[0.08em] shadow-[4px_4px_0_rgba(0,0,0,0.8)] transition ${className}`}
            style={variant === 'festival' ? { borderRadius: '999px 999px 999px 999px / 85% 85% 115% 115%' } : undefined}
        >
            {children}
        </span>
    );

    if (to) {
        return <Link to={to}>{content}</Link>;
    }

    return <button type="button">{content}</button>;
}

function OutlineCard({ children, className = '' }) {
    return (
        <div
            className={`rounded-[28px] border-2 border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] p-6 shadow-[6px_6px_0_rgba(0,0,0,0.8)] backdrop-blur-xl ${className}`}
        >
            {children}
        </div>
    );
}

function CharacterBlob({ className = '', color = '#25F2A0', secondary = '#A34DFF' }) {
    return (
        <div className={`pointer-events-none absolute ${className}`}>
            <div
                className="relative h-32 w-24 rounded-[45%_55%_55%_35%]"
                style={{ backgroundColor: color, boxShadow: '6px 6px 0 rgba(0,0,0,0.8)' }}
            >
                <div className="absolute left-6 top-4 h-12 w-12 rounded-full border-4 border-black bg-[#FFE7A7]" />
                <div className="absolute bottom-3 left-3 h-10 w-8 rounded-full border-4 border-black" style={{ backgroundColor: secondary }} />
                <div className="absolute bottom-1 right-1 h-12 w-9 rounded-full border-4 border-black bg-[#FFD327]" />
            </div>
        </div>
    );
}

export function LandingPage() {
    return (
        <div className="min-h-screen overflow-x-hidden bg-[#05020d] text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(163,77,255,0.28),transparent_24%),radial-gradient(circle_at_20%_30%,rgba(37,242,160,0.16),transparent_18%),radial-gradient(circle_at_80%_25%,rgba(255,102,214,0.14),transparent_15%)]" />

            <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#05020d]/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <YouConnectLogo compact showTag={false} className="max-w-[220px]" />

                    <div className="hidden items-center gap-8 text-sm font-semibold text-[#d8cfbd] md:flex">
                        <a href="#features" className="hover:text-white">Features</a>
                        <a href="#community" className="hover:text-white">Community</a>
                        <a href="#about" className="hover:text-white">About us</a>
                    </div>

                    <div className="hidden items-center gap-3 md:flex">
                        <StickerButton>Talk to an expert</StickerButton>
                        <StickerButton to="/sign-in" variant="festival">Login</StickerButton>
                    </div>
                </div>
            </nav>

            <header className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-14 text-center">
                <CharacterBlob className="-left-2 top-36 hidden md:block" />
                <CharacterBlob className="right-4 top-64 hidden md:block" color="#FF66D6" secondary="#25F2A0" />

                <div className="relative mx-auto max-w-5xl">
                    <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-[#25F2A0]">
                        The future of learning
                    </p>
                    <div className="mb-8 flex justify-center">
                        <YouConnectLogo showTag={false} className="items-center text-center" />
                    </div>
                    <h1 className="font-display text-6xl font-extrabold uppercase leading-[0.86] tracking-tight md:text-[7.5rem]">
                        <span className="block rotate-[-3deg] text-[#FFF3DC]">Learn Faster.</span>
                        <span className="block rotate-[2deg] text-[#29CFFF]">Share Knowledge.</span>
                        <span className="block rotate-[-2deg] text-[#FFD327]">Grow Together.</span>
                    </h1>
                </div>

                <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-[#d8cfbd] md:text-lg">
                    YouConnect is a collaborative learning platform where students ask questions, share technical blogs, and collaborate with peers using AI-powered knowledge validation.
                </p>

                <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                    <StickerButton to="/sign-in" variant="festival">Login</StickerButton>
                    <StickerButton>Talk to an expert</StickerButton>
                </div>

                <div className="relative mx-auto mt-16 max-w-5xl">
                    <div className="absolute left-1/2 top-1/2 -z-10 h-64 w-4/5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#A34DFF]/20 blur-[120px]" />
                    <div className="overflow-hidden rounded-[34px] border-2 border-white/10 bg-black shadow-[8px_8px_0_rgba(0,0,0,0.9)]">
                        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
                            <div className="flex gap-2">
                                <div className="h-3 w-3 rounded-full bg-[#ff6f61]" />
                                <div className="h-3 w-3 rounded-full bg-[#ffd327]" />
                                <div className="h-3 w-3 rounded-full bg-[#25f2a0]" />
                            </div>
                            <span className="rounded-full bg-[#25F2A0] px-4 py-1 text-xs font-black uppercase tracking-[0.22em] text-black">
                                Live UI
                            </span>
                        </div>

                        <div className="grid gap-4 bg-[linear-gradient(180deg,rgba(163,77,255,0.08),rgba(5,2,13,1))] p-6 md:grid-cols-[1.1fr_0.9fr]">
                            <div className="relative rotate-[-2deg] rounded-[30px] border-2 border-black bg-[#FFF3DC] p-6 text-left text-black shadow-[6px_6px_0_rgba(0,0,0,0.85)]">
                                <div className="absolute right-5 top-5 h-5 w-5 rounded-full bg-[#FFD327]" />
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7b5c3d]">Student dashboard</p>
                                <h3 className="mt-3 font-display text-4xl font-extrabold leading-none">Questions, blogs, clubs, events, progress.</h3>
                                <p className="mt-4 text-sm leading-7 text-[#4d4239]">
                                    One platform for peer learning, technical sharing, moderation, and community life.
                                </p>
                            </div>
                            <div className="grid gap-4">
                                <div className="rotate-[2deg] rounded-[28px] border-2 border-black bg-[#A34DFF] p-5 text-left shadow-[6px_6px_0_rgba(0,0,0,0.85)]">
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-white/75">Reputation</p>
                                    <p className="mt-3 font-display text-6xl font-extrabold leading-none text-[#FFF3DC]">1280</p>
                                </div>
                                <div className="rotate-[-2deg] rounded-[28px] border-2 border-black bg-[#25F2A0] p-5 text-left text-black shadow-[6px_6px_0_rgba(0,0,0,0.85)]">
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-black/65">Notifications</p>
                                    <p className="mt-3 font-display text-6xl font-extrabold leading-none">12</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <section className="relative z-10 py-6 text-center">
                <div className="inline-flex rotate-[-2deg] items-center gap-3 rounded-[2rem] border-2 border-black bg-[#FFF3DC] px-6 py-4 text-black shadow-[6px_6px_0_rgba(0,0,0,0.85)]">
                    <span className="font-display text-4xl font-extrabold text-[#29CFFF]">You</span>
                    <span className="font-display text-4xl font-extrabold text-[#111]">Code</span>
                    <span className="rounded-full bg-[#FFD327] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]">Community</span>
                </div>
            </section>

            <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <div className="mb-5 flex justify-center">
                        <span className="rounded-full bg-[#25F2A0] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                            Feature stage
                        </span>
                    </div>
                    <h2 className="font-display text-5xl font-extrabold text-[#FFF3DC]">Features that work for your future.</h2>
                    <p className="mt-5 text-lg text-[#d8cfbd]">Check out our amazing features and experience the power of workflow for yourself.</p>
                </div>

                <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
                    {features.map((feature, index) => {
                        const cardColors = ['#A34DFF', '#25F2A0', '#FFD327', '#FF66D6'];
                        return (
                            <OutlineCard key={feature.title} className={`relative overflow-hidden ${index % 2 === 1 ? 'md:translate-y-8' : ''}`}>
                                <div
                                    className="mb-5 inline-flex rounded-2xl border-2 border-black p-3 shadow-[4px_4px_0_rgba(0,0,0,0.8)]"
                                    style={{ backgroundColor: cardColors[index], color: index === 1 || index === 2 ? '#111' : '#fff' }}
                                >
                                    <span className="font-display text-lg font-extrabold">{String(index + 1).padStart(2, '0')}</span>
                                </div>
                                <h3 className="font-display text-3xl font-extrabold text-[#FFF3DC]">{feature.title}</h3>
                                <p className="mt-4 text-[15px] leading-7 text-[#d8cfbd]">{feature.description}</p>
                            </OutlineCard>
                        );
                    })}

                    <OutlineCard className="mt-8 md:col-span-2 border-white/20 bg-[linear-gradient(140deg,rgba(163,77,255,0.18)_0%,rgba(41,207,255,0.08)_35%,rgba(255,255,255,0.02)_100%)] md:mt-12">
                        <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr]">
                            <div>
                                <div className="mb-5 inline-flex rounded-2xl border-2 border-black bg-[#29CFFF] p-3 text-black shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
                                    <span className="font-display text-lg font-extrabold">DEV</span>
                                </div>
                                <h3 className="font-display text-3xl font-extrabold text-[#FFF3DC]">Code collaboration</h3>
                                <p className="mt-4 text-[15px] leading-7 text-[#d8cfbd]">
                                    YouConnect uses advanced knowledge synchronization technology to ensure that information shared across the platform is always up to date and reliable. Whether students are asking questions, publishing technical blogs, or collaborating with peers and teachers, YouConnect automatically organizes and updates the content in real time.
                                </p>
                            </div>

                            <div className="overflow-hidden rounded-[24px] border-2 border-white/10 bg-[#050014] p-5 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
                                <div className="mb-4 flex gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                                </div>
                                <p className="mb-3 border-b border-white/10 pb-2 text-xs uppercase tracking-[0.22em] text-[#6272a4]">Digital Token.js</p>
                                <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-[#d8cfbd]">
                                    <code>
                                        <span className="text-[#6272a4]">{'// Authentication Token'}</span>
                                        {'\n'}
                                        <span className="text-[#ff79c6]">function</span> <span className="text-[#50fa7b]">verifyStudentToken</span>(num1, num2) {'{'}
                                        {'\n  '}
                                        <span className="text-[#ff79c6]">let</span> sum = num1 + num2;
                                        {'\n  '}
                                        <span className="text-[#ff79c6]">if</span> (sum <span className="text-[#ff79c6]">{'>'}</span> <span className="text-[#bd93f9]">0</span>) {'{'}
                                        {'\n    '}
                                        <span className="text-[#ff79c6]">return</span> <span className="text-[#f1fa8c]">'Valid'</span>;
                                        {'\n  }'}
                                        {'\n  '}
                                        <span className="text-[#ff79c6]">return</span> <span className="text-[#f1fa8c]">'Invalid'</span>;
                                        {'\n'}
                                        {'}'}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </OutlineCard>
                </div>
            </section>

            <section id="community" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
                <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1fr_0.95fr]">
                    <div>
                        <div className="mb-5">
                            <span className="rounded-full bg-[#FF66D6] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                                Community mode
                            </span>
                        </div>
                        <h2 className="font-display text-5xl font-extrabold text-[#FFF3DC]">Built for community-driven learning</h2>
                        <p className="mt-6 text-lg leading-8 text-[#d8cfbd]">
                            Learning is better together. Engage with a community of motivated YouCode students to solve problems, share insights, and build your technical network.
                        </p>

                        <div className="mt-8 inline-flex rotate-[-2deg] rounded-[1.6rem] border-2 border-black bg-[#FFF3DC] px-4 py-3 text-black shadow-[5px_5px_0_rgba(0,0,0,0.85)]">
                            <span className="text-xs font-black uppercase tracking-[0.18em]">Peer learning • clubs • events • blogs</span>
                        </div>

                        <ul className="mt-8 space-y-4">
                            {[
                                'Ask questions and get answers',
                                'Join discussions with peers',
                                'Connect with students from different campuses',
                                'Learn together in a supportive environment',
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-[#FFF3DC]">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-[#A34DFF] font-black text-white shadow-[4px_4px_0_rgba(0,0,0,0.85)]">✓</div>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative grid grid-cols-2 gap-4">
                        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#A34DFF]/20 blur-[100px]" />
                        {stats.map((stat, index) => {
                            const colors = ['#25F2A0', '#A34DFF', '#FF66D6', '#FFD327'];
                            return (
                                <div
                                    key={stat.label}
                                    className={`rounded-[30px] border-2 border-black p-6 text-center shadow-[6px_6px_0_rgba(0,0,0,0.85)] ${
                                        index === 0
                                            ? 'rotate-[-3deg]'
                                            : index === 1
                                              ? 'translate-y-8 rotate-[2deg]'
                                              : index === 2
                                                ? 'rotate-[2deg]'
                                                : 'translate-y-6 rotate-[-2deg]'
                                    }`}
                                    style={{ backgroundColor: colors[index], color: index === 0 || index === 3 ? '#111' : '#fff' }}
                                >
                                    <div className="font-display text-5xl font-extrabold leading-none">{stat.value}</div>
                                    <div className="mt-3 text-sm font-black uppercase tracking-[0.18em] opacity-85">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section id="about" className="relative z-10 mx-auto max-w-7xl px-6 py-20">
                <div className="mx-auto mb-14 max-w-3xl text-center">
                    <div className="mb-5 flex justify-center">
                        <span className="rounded-full bg-[#29CFFF] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                            About the platform
                        </span>
                    </div>
                    <h2 className="font-display text-5xl font-extrabold text-[#FFF3DC]">About YouConnect</h2>
                    <p className="mt-5 text-lg leading-8 text-[#d8cfbd]">
                        YouConnect is a collaborative learning platform for YouCode students that centralizes technical questions, blogs, collaboration, and AI-assisted learning in one place.
                    </p>
                </div>

                <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
                    {aboutCards.map((card) => (
                        <OutlineCard key={card.title} className={`text-center ${card.title === 'Innovation' ? 'md:-translate-y-6' : ''}`}>
                            <div
                                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.8)]"
                                style={{ backgroundColor: card.color }}
                            >
                                <span className="font-display text-2xl font-extrabold text-black">★</span>
                            </div>
                            <h3 className="font-display text-3xl font-extrabold text-[#FFF3DC]">{card.title}</h3>
                            <p className="mt-4 text-[15px] leading-7 text-[#d8cfbd]">{card.description}</p>
                        </OutlineCard>
                    ))}
                </div>
            </section>

            <section className="relative z-10 mx-auto max-w-7xl px-6 py-20">
                <OutlineCard className="mx-auto max-w-4xl border-white/20 bg-[linear-gradient(145deg,rgba(255,102,214,0.16)_0%,rgba(163,77,255,0.12)_30%,rgba(255,255,255,0.03)_100%)] text-center">
                    <div className="absolute left-1/2 top-0 h-32 w-4/5 -translate-x-1/2 rounded-full bg-[#A34DFF]/25 blur-[90px]" />
                    <div className="relative z-10">
                        <div className="mb-5">
                            <span className="rounded-full bg-[#FFD327] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                                Final call
                            </span>
                        </div>
                        <h2 className="font-display text-5xl font-extrabold text-[#FFF3DC]">Smart Learning Insights for YouCode Students</h2>
                        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#d8cfbd]">
                            Unlock the power of collaborative learning with YouConnect. Ask questions, share knowledge through blogs, join clubs, and communicate with your peers. With AI-assisted recommendations and moderation, the platform creates a focused and supportive learning environment.
                        </p>
                        <div className="mt-10">
                            <StickerButton>Get Started</StickerButton>
                        </div>
                    </div>
                </OutlineCard>
            </section>

            <footer className="relative z-10 mt-16 overflow-hidden border-t border-white/10 bg-[linear-gradient(180deg,#0B0126_0%,#07020e_100%)] pb-8 pt-20 backdrop-blur-md">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(255,102,214,0.18),transparent_45%),radial-gradient(circle_at_70%_0%,rgba(37,242,160,0.16),transparent_35%),radial-gradient(circle_at_20%_0%,rgba(41,207,255,0.14),transparent_35%)]" />
                <div className="mx-auto max-w-5xl px-8">
                    <div className="mb-14 flex flex-col items-start justify-between gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[6px_6px_0_rgba(0,0,0,0.85)] backdrop-blur-md md:flex-row md:items-center">
                        <div>
                            <p className="mb-3 inline-flex rounded-full bg-[#FFD327] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                                Stay in the loop
                            </p>
                            <h3 className="font-display text-4xl font-extrabold text-[#FFF3DC]">Build, share, and level up with YouConnect.</h3>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d8cfbd]">
                                Join a coding community where questions, blogs, events, and collaboration all live in one bold platform.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <StickerButton to="/sign-in" variant="festival">Login</StickerButton>
                            <StickerButton>Talk to an expert</StickerButton>
                        </div>
                    </div>

                    <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <h4 className="mb-6 font-bold text-white">Contact</h4>
                            <ul className="space-y-3 text-[14px] text-[#d8cfbd]">
                                <li><a href="#" className="hover:text-white">contact@youconnect.app</a></li>
                                <li><a href="#" className="hover:text-white">support@youconnect.app</a></li>
                                <li><a href="#" className="hover:text-white">partners@youconnect.app</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-6 font-bold text-white">Careers</h4>
                            <p className="mb-3 text-[14px] text-[#d8cfbd]">Join our mission to improve student collaboration and learning.</p>
                            <a href="#" className="text-[14px] text-[#FF66D6] hover:text-white">careers@youconnect.app</a>
                        </div>
                        <div>
                            <h4 className="mb-6 font-bold text-white">Address</h4>
                            <ul className="space-y-1 text-[14px] text-[#d8cfbd]">
                                <li>YouCode Campus</li>
                                <li>Nador - Safi - Youssoufia</li>
                                <li>Morocco</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-6 font-bold text-white">Social</h4>
                            <ul className="space-y-3 text-[14px] text-[#d8cfbd]">
                                <li><a href="#" className="hover:text-white">Twitter</a></li>
                                <li><a href="#" className="hover:text-white">Instagram</a></li>
                                <li><a href="#" className="hover:text-white">TikTok</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between border-t border-white/10 pt-8 text-[13px] text-gray-500 md:flex-row">
                        <p>© 2026 YouConnect Platform. All Rights Reserved.</p>
                        <div className="mt-4 flex items-center gap-6 md:mt-0">
                            <a href="#" className="hover:text-white">Terms of Service</a>
                            <a href="#" className="hover:text-white">Privacy Policy</a>
                            <YouConnectLogo compact showTag={false} className="ml-4 scale-75 origin-left" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
