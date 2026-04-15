import { NavLink, Outlet } from 'react-router-dom';
import { YouConnectLogo } from '../components/YouConnectLogo';

const navigationItems = [
    { to: '/app', label: 'Dashboard' },
    { to: '/app/questions', label: 'Questions' },
    { to: '/app/blogs', label: 'Blogs' },
    { to: '/app/notifications', label: 'Notifications' },
    { to: '/app/profile', label: 'Profile' },
];

export function AppLayout() {
    return (
        <div className="min-h-screen bg-[#05020d] text-white lg:grid lg:grid-cols-[290px_1fr]">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(163,77,255,0.22),transparent_22%),radial-gradient(circle_at_20%_35%,rgba(37,242,160,0.12),transparent_18%),radial-gradient(circle_at_80%_20%,rgba(255,102,214,0.12),transparent_16%)]" />

            <aside className="relative border-b border-white/10 bg-[#0B0126]/80 px-6 py-6 backdrop-blur-md lg:min-h-screen lg:border-b-0 lg:border-r lg:border-r-white/10">
                <div className="mb-8">
                    <YouConnectLogo compact showTag={false} className="max-w-[220px]" />
                </div>

                <div className="mb-6 rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#25F2A0]">Student mode</p>
                    <p className="mt-2 text-sm leading-6 text-[#d8cfbd]">
                        Questions, blogs, notifications, and progress all in one vivid workspace.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {['XP +120', '3 badges', '2 reviews pending'].map((chip, index) => (
                            <span
                                key={chip}
                                className={[
                                    'rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-black shadow-[3px_3px_0_rgba(0,0,0,0.8)]',
                                    index === 0 ? 'bg-[#FFD327]' : index === 1 ? 'bg-[#29CFFF]' : 'bg-[#FF66D6]',
                                ].join(' ')}
                            >
                                {chip}
                            </span>
                        ))}
                    </div>
                </div>

                <nav className="grid gap-3">
                    {navigationItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/app'}
                            className={({ isActive }) =>
                                [
                                    'rounded-[1.4rem] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] transition shadow-[4px_4px_0_rgba(0,0,0,0.8)]',
                                    isActive
                                        ? 'border-2 border-black bg-[linear-gradient(135deg,#A34DFF_0%,#29CFFF_45%,#25F2A0_80%,#FFD327_100%)] text-black'
                                        : 'border border-white/10 bg-white/5 text-[#d8cfbd] hover:bg-white/10 hover:text-white',
                                ].join(' ')
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <div className="relative min-h-screen">
                <header className="border-b border-white/10 bg-[#05020d]/70 px-6 py-4 backdrop-blur-md">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#25F2A0]">Prototype</p>
                            <h1 className="font-display text-4xl font-extrabold text-[#FFF3DC]">Frontend test environment</h1>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#d8cfbd] shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
                                Search and notification controls coming next
                            </div>
                            <div className="rounded-full bg-[linear-gradient(135deg,#A34DFF_0%,#29CFFF_45%,#25F2A0_80%,#FFD327_100%)] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
                                React UI lab
                            </div>
                        </div>
                    </div>
                </header>

                <main className="relative px-6 py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
