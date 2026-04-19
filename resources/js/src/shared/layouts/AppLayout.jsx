import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { YouConnectLogo } from '../components/YouConnectLogo';
import { logout } from '../../services/api/auth.service';
import { useAuth } from '../../hooks/useAuth';
import { getNotifications } from '../../services/api/notifications.service';
import {
    getRoleLabel,
    isAdmin,
    isBdeMembre,
    isFormateur,
} from '../utils/roles';

function getPrimaryNavigationItems(user, unreadNotificationsCount) {
    const items = [
        { to: '/app', label: 'Dashboard' },
        { to: '/app/questions', label: 'Questions' },
        { to: '/app/blogs', label: 'Blogs' },
        { to: '/app/notifications', label: 'Notifications', badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null },
        { to: '/app/profile', label: 'Profile' },
    ];

    if (isAdmin(user)) {
        items.splice(1, 0, { to: '/app/admin/badges-interests', label: 'Admin Lab' });
    }

    return items;
}

function getSidebarSections(user, unreadNotificationsCount) {
    const sections = [
        {
            title: 'Main',
            items: [
                { to: '/app', label: 'Dashboard', icon: 'DB' },
                { to: '/app/questions', label: 'Questions', icon: 'Q' },
                { to: '/app/blogs', label: 'Blogs', icon: 'BL' },
            ],
        },
        {
            title: 'Account',
            items: [
                { to: '/app/notifications', label: 'Notifications', icon: 'NT', badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null },
                { to: '/app/profile', label: 'Profile', icon: 'PR' },
            ],
        },
    ];

    if (isAdmin(user)) {
        sections.push({
            title: 'Admin',
            items: [
                { to: '/app/admin/badges-interests', label: 'Admin Lab', icon: 'AD' },
            ],
        });
    }

    return sections;
}

function getRoleTheme(user) {
    if (isAdmin(user)) {
        return {
            eyebrow: 'Admin command center',
            title: 'Operate the platform with confidence',
            description: 'Manage tools, shape recognition systems, and keep the workspace moving with clear decisions.',
            spotlight: 'Control room',
            gradient: 'from-[#FFD327]/22 via-[#FF8B1F]/10 to-transparent',
        };
    }

    if (isFormateur(user)) {
        return {
            eyebrow: 'Formateur workspace',
            title: 'Guide students with sharper visibility',
            description: 'Stay close to questions, review content, and catch the signals that need mentor attention.',
            spotlight: 'Teaching focus',
            gradient: 'from-[#25F2A0]/22 via-[#29CFFF]/10 to-transparent',
        };
    }

    if (isBdeMembre(user)) {
        return {
            eyebrow: 'Community operations',
            title: 'Keep the campus energy alive',
            description: 'Surface community moments, maintain momentum, and make shared spaces feel active and welcoming.',
            spotlight: 'Community pulse',
            gradient: 'from-[#FF66D6]/20 via-[#FFD327]/10 to-transparent',
        };
    }

    return {
        eyebrow: 'Learning workspace',
        title: 'Build momentum in one focused space',
        description: 'Move between questions, blogs, notifications, and your profile without losing your rhythm.',
        spotlight: 'Student focus',
        gradient: 'from-[#29CFFF]/20 via-[#A34DFF]/10 to-transparent',
    };
}

function getInitials(name) {
    if (!name) {
        return 'YC';
    }

    return name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}

function SearchIcon() {
    return (
        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M13 13l4 4" />
        </svg>
    );
}

function BellIcon() {
    return (
        <svg viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current stroke-[1.7]">
            <path d="M10 3a4 4 0 0 0-4 4v2.2c0 .8-.2 1.5-.7 2.1L4 13h12l-1.3-1.7a3.6 3.6 0 0 1-.7-2.1V7a4 4 0 0 0-4-4Z" />
            <path d="M8 15a2 2 0 0 0 4 0" />
        </svg>
    );
}

function BookmarkIcon() {
    return (
        <svg viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current stroke-[1.7]">
            <path d="M6 3h8a1 1 0 0 1 1 1v12l-5-3-5 3V4a1 1 0 0 1 1-1Z" />
        </svg>
    );
}

function GridIcon() {
    return (
        <svg viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current stroke-[1.7]">
            <rect x="3" y="3" width="5" height="5" rx="1" />
            <rect x="12" y="3" width="5" height="5" rx="1" />
            <rect x="3" y="12" width="5" height="5" rx="1" />
            <rect x="12" y="12" width="5" height="5" rx="1" />
        </svg>
    );
}

export function AppLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut, user } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const [isCommunityMenuOpen, setIsCommunityMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const communityMenuRef = useRef(null);
    const profileMenuRef = useRef(null);
    const navigationItems = getPrimaryNavigationItems(user, unreadNotificationsCount);
    const sidebarSections = getSidebarSections(user, unreadNotificationsCount);
    const roleTheme = useMemo(() => getRoleTheme(user), [user]);
    const avatarFallback = getInitials(user?.name);

    useEffect(() => {
        let isMounted = true;

        async function loadUnreadNotificationsCount() {
            if (!user?.id) {
                setUnreadNotificationsCount(0);
                return;
            }

            try {
                const response = await getNotifications();

                if (!isMounted) {
                    return;
                }

                setUnreadNotificationsCount(response?.unread_count || 0);
            } catch {
                if (!isMounted) {
                    return;
                }

                setUnreadNotificationsCount(0);
            }
        }

        loadUnreadNotificationsCount();

        return () => {
            isMounted = false;
        };
    }, [user]);

    useEffect(() => {
        function handleOutsideClick(event) {
            if (communityMenuRef.current && !communityMenuRef.current.contains(event.target)) {
                setIsCommunityMenuOpen(false);
            }

            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    useEffect(() => {
        setIsCommunityMenuOpen(false);
        setIsProfileMenuOpen(false);
    }, [location.pathname]);

    async function handleLogout() {
        setIsLoggingOut(true);

        try {
            await logout();
        } catch {
            // Even if the backend request fails, we still clear the local session.
        } finally {
            signOut();
            navigate('/sign-in', { replace: true });
            setIsLoggingOut(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#05020d] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(163,77,255,0.18),transparent_20%),radial-gradient(circle_at_20%_35%,rgba(37,242,160,0.08),transparent_18%),radial-gradient(circle_at_80%_20%,rgba(255,102,214,0.08),transparent_16%)]" />

            <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070311]/95 px-4 py-3 backdrop-blur-xl lg:px-6">
                <div className="flex flex-wrap items-center gap-4">
                    <Link to="/app" className="shrink-0">
                        <YouConnectLogo compact showTag={false} className="max-w-[210px]" />
                    </Link>

                    <div ref={communityMenuRef} className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                setIsCommunityMenuOpen((current) => !current);
                                setIsProfileMenuOpen(false);
                            }}
                            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-black text-[#FFF3DC] transition hover:bg-white/10"
                        >
                            {roleTheme.spotlight}
                        </button>

                        {isCommunityMenuOpen ? (
                            <div className="absolute left-0 z-20 mt-3 w-[280px] rounded-[1.6rem] border border-white/10 bg-[#0B0126] p-4 shadow-[8px_8px_0_rgba(0,0,0,0.85)]">
                                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#25F2A0]">Workspace sections</p>
                                <div className="mt-3 grid gap-2">
                                    {navigationItems.map((item) => (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            className="rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-[#d8cfbd] transition hover:bg-white/10 hover:text-white"
                                        >
                                            <span className="flex items-center justify-between gap-3">
                                                <span>{item.label}</span>
                                                {item.badge ? (
                                                    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#1E2234] px-2 py-1 text-[10px] font-black leading-none text-[#FFF3DC]">
                                                        {item.badge}
                                                    </span>
                                                ) : null}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <nav className="hidden flex-1 items-center gap-2 xl:flex">
                        {navigationItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/app'}
                                className={({ isActive }) =>
                                    [
                                        'rounded-full px-4 py-2 text-sm font-black transition',
                                        isActive
                                            ? 'bg-white/12 text-[#FFF3DC]'
                                            : 'text-[#d8cfbd] hover:bg-white/8 hover:text-white',
                                    ].join(' ')
                                }
                            >
                                <span className="flex items-center gap-2">
                                    <span>{item.label}</span>
                                    {item.badge ? (
                                        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#FFD327] px-2 py-1 text-[10px] font-black leading-none text-black">
                                            {item.badge}
                                        </span>
                                    ) : null}
                                </span>
                            </NavLink>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-3">
                        <label className="hidden items-center gap-3 rounded-full border border-white/10 bg-[#0B0126] px-4 py-2 text-sm text-[#d8cfbd] lg:flex">
                            <SearchIcon />
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-40 bg-transparent text-sm text-white outline-none placeholder:text-[#8f8798]"
                            />
                        </label>

                        <Link to="/app/notifications" className="relative rounded-full border border-white/10 bg-white/5 p-3 text-[#d8cfbd] transition hover:bg-white/10 hover:text-white">
                            <BellIcon />
                            {unreadNotificationsCount ? (
                                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[#FFD327] px-1.5 py-1 text-[10px] font-black leading-none text-black">
                                    {unreadNotificationsCount}
                                </span>
                            ) : null}
                        </Link>

                        <button type="button" className="rounded-full border border-white/10 bg-white/5 p-3 text-[#d8cfbd] transition hover:bg-white/10 hover:text-white">
                            <BookmarkIcon />
                        </button>

                        <div ref={profileMenuRef} className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsProfileMenuOpen((current) => !current);
                                    setIsCommunityMenuOpen(false);
                                }}
                                className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 shadow-[4px_4px_0_rgba(0,0,0,0.7)] transition hover:bg-white/10"
                            >
                                {user?.photo ? (
                                    <img
                                        src={user.photo}
                                        alt={user.name}
                                        className="h-10 w-10 rounded-full border-2 border-black object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-[linear-gradient(135deg,#29CFFF_0%,#25F2A0_58%,#FFD327_100%)] text-sm font-black text-black">
                                        {avatarFallback}
                                    </div>
                                )}
                                <div className="hidden text-left md:block">
                                    <p className="text-sm font-black text-[#FFF3DC]">{user?.name || 'Workspace user'}</p>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d8cfbd]">{getRoleLabel(user)}</p>
                                </div>
                            </button>

                            {isProfileMenuOpen ? (
                                <div className="absolute right-0 z-20 mt-3 w-[280px] rounded-[1.6rem] border border-white/10 bg-[#0B0126] p-4 shadow-[8px_8px_0_rgba(0,0,0,0.85)]">
                                    <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                                        <p className="text-sm font-black text-[#FFF3DC]">{user?.name}</p>
                                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#25F2A0]">{getRoleLabel(user)}</p>
                                    </div>

                                    <div className="mt-3 grid gap-2">
                                        <Link to="/app/profile" className="rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-[#d8cfbd] transition hover:bg-white/10 hover:text-white">
                                            View profile
                                        </Link>
                                        <Link to="/app/notifications" className="rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-[#d8cfbd] transition hover:bg-white/10 hover:text-white">
                                            Notifications
                                        </Link>
                                        {isAdmin(user) ? (
                                            <Link to="/app/admin/badges-interests" className="rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-[#d8cfbd] transition hover:bg-white/10 hover:text-white">
                                                Admin lab
                                            </Link>
                                        ) : null}
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                            className="rounded-[1rem] border border-[#ff8f8f]/40 bg-[#2a0b15] px-4 py-3 text-sm font-black text-[#ffb8b8] transition hover:bg-[#39101d] disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </header>

            <div className="relative lg:grid lg:grid-cols-[280px_1fr]">
                <aside className="hidden border-r border-white/10 bg-[#080413]/92 px-5 py-8 lg:block">
                    <div className="sticky top-[92px]">
                        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,4,19,0.98)_0%,rgba(10,6,22,0.98)_100%)] p-5 shadow-[6px_6px_0_rgba(0,0,0,0.8)]">
                            <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] px-4 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full border border-white/10 bg-[#0B0126] p-2 text-[#d8cfbd]">
                                        <GridIcon />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#25F2A0]">
                                            {roleTheme.spotlight}
                                        </p>
                                        <p className="mt-1 text-xl font-black text-[#FFF3DC]">Workspace</p>
                                    </div>
                                </div>
                                <p className="mt-3 max-w-[18rem] text-sm leading-6 text-[#bfb5c7]">
                                    Keep the navigation focused on the pages you actually use in YouConnect.
                                </p>
                            </div>

                            <div className="mt-8 space-y-8">
                                {sidebarSections.map((section) => (
                                    <div key={section.title}>
                                        <div className="mb-4 flex items-center justify-between px-2">
                                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8f8798]">
                                                {section.title}
                                            </p>
                                            <span className="h-px flex-1 bg-white/8 ml-3" />
                                        </div>

                                        <div className="grid gap-1.5">
                                            {section.items.map((item) => (
                                                <NavLink
                                                    key={`${section.title}-${item.to}`}
                                                    to={item.to}
                                                    end={item.to === '/app'}
                                                    className={({ isActive }) =>
                                                        [
                                                            'group flex items-center justify-between gap-3 rounded-[1rem] px-3 py-3 transition',
                                                            isActive
                                                                ? 'bg-[linear-gradient(135deg,rgba(48,52,97,0.96)_0%,rgba(27,30,58,0.96)_100%)] text-[#FFF3DC] shadow-[0_8px_24px_rgba(0,0,0,0.28)]'
                                                                : 'text-[#e7dfd2] hover:bg-white/6',
                                                        ].join(' ')
                                                    }
                                                >
                                                    <span className="flex min-w-0 items-center gap-3">
                                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/6 bg-white/5 text-[10px] font-black uppercase tracking-[0.08em] text-[#FFD327] transition group-hover:border-white/12 group-hover:bg-white/8">
                                                            {item.icon}
                                                        </span>
                                                        <span className="truncate text-[1.02rem] font-black">{item.label}</span>
                                                    </span>
                                                    {item.badge ? (
                                                        <span className="inline-flex min-w-7 items-center justify-center rounded-[0.7rem] border border-white/10 bg-white/10 px-2 py-1 text-[11px] font-black leading-none text-[#FFF3DC]">
                                                            {item.badge}
                                                        </span>
                                                    ) : null}
                                                </NavLink>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="min-h-screen">
                    <div className="border-b border-white/10 px-4 py-5 lg:hidden">
                        <div className="flex gap-3 overflow-x-auto">
                            {navigationItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.to === '/app'}
                                    className={({ isActive }) =>
                                        [
                                            'whitespace-nowrap rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em]',
                                            isActive
                                                ? 'bg-[#FFD327] text-black'
                                                : 'border border-white/10 bg-white/5 text-[#d8cfbd]',
                                        ].join(' ')
                                    }
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{item.label}</span>
                                        {item.badge ? (
                                            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#1E2234] px-2 py-1 text-[10px] font-black leading-none text-[#FFF3DC]">
                                                {item.badge}
                                            </span>
                                        ) : null}
                                    </span>
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    <main className="px-4 py-6 lg:px-6 lg:py-8">
                        <Outlet context={{ setUnreadNotificationsCount }} />
                    </main>
                </div>
            </div>
        </div>
    );
}
