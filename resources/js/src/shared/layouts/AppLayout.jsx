import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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

function getNavigationItems(user, unreadNotificationsCount) {
    const notificationItem = {
        to: '/app/notifications',
        label: 'Notifications',
        badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
    };

    if (isAdmin(user)) {
        return [
            { to: '/app', label: 'Dashboard' },
            notificationItem,
            { to: '/app/blogs', label: 'Blogs' },
            { to: '/app/questions', label: 'Questions' },
            { to: '/app/profile', label: 'Profile' },
        ];
    }

    if (isFormateur(user)) {
        return [
            { to: '/app', label: 'Dashboard' },
            { to: '/app/blogs', label: 'Blogs' },
            { to: '/app/questions', label: 'Questions' },
            notificationItem,
            { to: '/app/profile', label: 'Profile' },
        ];
    }

    if (isBdeMembre(user)) {
        return [
            { to: '/app', label: 'Dashboard' },
            { to: '/app/blogs', label: 'Blogs' },
            notificationItem,
            { to: '/app/questions', label: 'Questions' },
            { to: '/app/profile', label: 'Profile' },
        ];
    }

    return [
        { to: '/app', label: 'Dashboard' },
        { to: '/app/questions', label: 'Questions' },
        { to: '/app/blogs', label: 'Blogs' },
        notificationItem,
        { to: '/app/profile', label: 'Profile' },
    ];
}

export function AppLayout() {
    const navigate = useNavigate();
    const { signOut, user } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const navigationItems = getNavigationItems(user, unreadNotificationsCount);

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
        <div className="min-h-screen bg-[#05020d] text-white lg:grid lg:grid-cols-[290px_1fr]">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(163,77,255,0.22),transparent_22%),radial-gradient(circle_at_20%_35%,rgba(37,242,160,0.12),transparent_18%),radial-gradient(circle_at_80%_20%,rgba(255,102,214,0.12),transparent_16%)]" />

            <aside className="relative border-b border-white/10 bg-[#0B0126]/80 px-6 py-6 backdrop-blur-md lg:min-h-screen lg:border-b-0 lg:border-r lg:border-r-white/10">
                <div className="mb-8">
                    <YouConnectLogo compact showTag={false} className="max-w-[220px]" />
                </div>

                <div className="mb-6 rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#25F2A0]">Workspace</p>
                    <p className="mt-2 text-sm leading-6 text-[#d8cfbd]">
                        Questions, blogs, notifications, and progress all in one vivid workspace.
                    </p>
                    {user ? (
                        <>
                            <p className="mt-3 text-lg font-bold text-[#FFF3DC]">{user.name}</p>
                            <p className="mt-1 text-sm text-[#d8cfbd]">Role: {getRoleLabel(user)}</p>
                        </>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {['Questions', 'Blogs', 'Chat'].map((chip, index) => (
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
                            <span className="flex items-center justify-between gap-3">
                                <span>{item.label}</span>
                                {item.badge ? (
                                    <span className="inline-flex min-w-8 items-center justify-center rounded-[0.6rem] border border-black/20 bg-[#1E2234] px-2 py-1 text-[11px] font-black leading-none text-[#FFF3DC] shadow-[2px_2px_0_rgba(0,0,0,0.45)]">
                                        {item.badge}
                                    </span>
                                ) : null}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="mt-6 w-full rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#d8cfbd] shadow-[4px_4px_0_rgba(0,0,0,0.8)] transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
            </aside>

            <div className="relative min-h-screen">
                <header className="border-b border-white/10 bg-[#05020d]/70 px-6 py-4 backdrop-blur-md">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#25F2A0]">YouConnect</p>
                            <h1 className="font-display text-4xl font-extrabold text-[#FFF3DC]">Learning workspace</h1>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#d8cfbd] shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
                                API-connected frontend in progress
                            </div>
                            <div className="rounded-full bg-[linear-gradient(135deg,#A34DFF_0%,#29CFFF_45%,#25F2A0_80%,#FFD327_100%)] px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
                                React app shell
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-3 overflow-x-auto lg:hidden">
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
                </header>

                <main className="relative px-6 py-8">
                    <Outlet context={{ setUnreadNotificationsCount }} />
                </main>
            </div>
        </div>
    );
}
