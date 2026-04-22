import { SectionCard } from '../../../shared/components/SectionCard';
import { StatCard } from '../../../shared/components/StatCard';
import { useAuth } from '../../../hooks/useAuth';
import { getRoleLabel, isAdmin, isBdeMembre, isFormateur } from '../../../shared/utils/roles';
import { useDashboardData } from '../hooks/useDashboardData';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';
import { Link } from 'react-router-dom';
import { UserIntelligenceTable } from '../components/UserIntelligenceTable';

const DASHBOARD_CONTENT = {
    student: {
        eyebrow: 'Student dashboard',
        title: 'Your learning arena is live.',
        description: 'Focus on answering, publishing, collecting reputation, and staying active in the community.',
        missionLabel: 'Daily mission',
        missionTitle: 'Answer, publish, collect proof of growth.',
        missionCopy: 'This student view should help you move fast between learning goals, questions, blogs, and events.',
        actions: [
            { title: 'Ask a question', href: '/app/questions', tone: 'bg-[#29CFFF]', copy: 'Get unstuck fast with tags, context, and community replies.' },
            { title: 'Write a blog', href: '/app/blogs', tone: 'bg-[#FFD327]', copy: 'Share a lesson, a recap, or a tutorial you wish you had earlier.' },
            { title: 'Check alerts', href: '/app/notifications', tone: 'bg-[#25F2A0]', copy: 'See approvals, replies, and signals you should react to.' },
            { title: 'Explore events', href: '/app/events', tone: 'bg-[#FF66D6]', copy: 'Join workshops and club meetups that match your interests.' },
        ],
        feedTitle: 'What students should do first',
        feedDescription: 'A quick queue built from real activity: questions, blogs, and alerts worth opening next.',
        railTitle: 'Progress and activity',
        railDescription: 'This rail keeps the growth feeling visible: streaks, clubs, and earned proof.',
        railLead: 'Reputation',
        listTitle: 'Badges & interests',
    },
    formateur: {
        eyebrow: 'Formateur dashboard',
        title: 'Guide the learning flow.',
        description: 'Your dashboard should make moderation, student support, and knowledge quality easier to manage.',
        missionLabel: 'Focus today',
        missionTitle: 'Review, approve, unblock, and mentor.',
        missionCopy: 'This view brings together the spaces where a formateur creates momentum for the whole learning community.',
        actions: [
            { title: 'Review blogs', href: '/app/blogs', tone: 'bg-[#FFD327]', copy: 'Clear the moderation queue and improve content quality.' },
            { title: 'Answer questions', href: '/app/questions', tone: 'bg-[#29CFFF]', copy: 'Jump into active threads where students are blocked.' },
            { title: 'Check alerts', href: '/app/notifications', tone: 'bg-[#25F2A0]', copy: 'Catch approvals, mentions, and student follow-ups.' },
            { title: 'Your profile', href: '/app/profile', tone: 'bg-[#FF66D6]', copy: 'Keep your mentor profile and badges visible and up to date.' },
        ],
        feedTitle: 'What formateurs should do first',
        feedDescription: 'Use the dashboard as a teaching control room: triage content, answer blockers, and keep signals healthy.',
        railTitle: 'Teaching rhythm',
        railDescription: 'A quick side rail for review pace, mentoring focus, and active learning groups.',
        railLead: 'Pending blogs',
        listTitle: 'Badges & interests',
    },
    admin: {
        eyebrow: 'Admin dashboard',
        title: 'Steer the platform with clarity.',
        description: 'Use this home screen to monitor users, moderation, reputation signals, and overall platform health.',
        missionLabel: 'Control center',
        missionTitle: 'Protect quality, enable people, and unblock operations.',
        missionCopy: 'This admin view should highlight the biggest management actions first and keep platform-wide work visible.',
        actions: [
            { title: 'Tags & topics', href: '/app/admin/tags', tone: 'bg-[#29CFFF]', copy: 'Keep discovery clean: merge duplicates and standardize naming.' },
            { title: 'Badges & interests', href: '/app/admin/badges-interests', tone: 'bg-[#FFD327]', copy: 'Manage recognition and personalization signals across the platform.' },
            { title: 'Review blogs', href: '/app/blogs', tone: 'bg-[#25F2A0]', copy: 'Approve, reject, and highlight community content.' },
            { title: 'Notification center', href: '/app/notifications', tone: 'bg-[#FF66D6]', copy: 'Monitor what is new and what still needs attention.' },
        ],
        feedTitle: 'What admins should do first',
        feedDescription: 'This admin feed should stay focused on risk, approvals, and the parts of the product that need decisive action.',
        railTitle: 'Platform snapshot',
        railDescription: 'A compact right rail to keep system-wide momentum visible without leaving the dashboard.',
        railLead: 'Users',
        listTitle: 'Badges & interests',
    },
    bde_membre: {
        eyebrow: 'BDE dashboard',
        title: 'Keep the community moving.',
        description: 'This version of the dashboard should help BDE members promote events, clubs, and visible campus energy.',
        missionLabel: 'Community pulse',
        missionTitle: 'Launch events, grow clubs, and keep students engaged.',
        missionCopy: 'Use this home view to push momentum through clubs, workshops, campaigns, and campus activities.',
        actions: [
            { title: 'Publish events', href: '/app/events', tone: 'bg-[#FF66D6]', copy: 'Launch workshops and campus moments with strong visuals.' },
            { title: 'Manage clubs', href: '/app/clubs', tone: 'bg-[#25F2A0]', copy: 'Keep clubs active, visible, and welcoming.' },
            { title: 'Share highlights', href: '/app/blogs', tone: 'bg-[#FFD327]', copy: 'Publish posts that capture community energy.' },
            { title: 'Check alerts', href: '/app/notifications', tone: 'bg-[#29CFFF]', copy: 'Track joins and signals across events and clubs.' },
        ],
        feedTitle: 'What BDE members should do first',
        feedDescription: 'This feed keeps community-building work at the center: events, clubs, and visible activity.',
        railTitle: 'Community momentum',
        railDescription: 'Track attendance energy, club health, and what needs extra promotion this week.',
        railLead: 'Upcoming events',
        listTitle: 'Clubs to spotlight',
    },
};

function getDashboardContent(user) {
    if (isAdmin(user)) {
        return DASHBOARD_CONTENT.admin;
    }

    if (isFormateur(user)) {
        return DASHBOARD_CONTENT.formateur;
    }

    if (isBdeMembre(user)) {
        return DASHBOARD_CONTENT.bde_membre;
    }

    return DASHBOARD_CONTENT.student;
}

function formatCount(value) {
    return new Intl.NumberFormat().format(value || 0);
}

function getUnreadNotifications(notifications) {
    return notifications.filter((item) => !item.is_read).length;
}

function getPendingBlogs(blogs) {
    return blogs.filter((item) => item.status === 'pending').length;
}

function getOpenQuestions(questions) {
    return questions.filter((item) => item.status !== 'closed').length;
}

function getUpcomingEvents(events) {
    return events.filter((item) => item.status === 'upcoming').length;
}

function safeText(value, fallback = 'Untitled') {
    const text = String(value || '').trim();
    return text.length ? text : fallback;
}

function getRoleStats(user, data) {
    if (isAdmin(user)) {
        return [
            { label: 'Users in system', value: formatCount(data.usersTotal), hint: 'current workspace', accent: 'rgb(var(--brand-mint))' },
            { label: 'Unread alerts', value: formatCount(getUnreadNotifications(data.notifications)), hint: 'needs attention', accent: 'rgb(var(--brand-violet))' },
            { label: 'Pending blogs', value: formatCount(getPendingBlogs(data.blogs)), hint: 'content pipeline', accent: 'rgb(var(--brand-gold))' },
        ];
    }

    if (isFormateur(user)) {
        return [
            { label: 'Pending blogs', value: formatCount(getPendingBlogs(data.blogs)), hint: 'awaiting review', accent: 'rgb(var(--brand-gold))' },
            { label: 'Open questions', value: formatCount(getOpenQuestions(data.questions)), hint: 'students need guidance', accent: 'rgb(var(--brand-violet))' },
            { label: 'Unread alerts', value: formatCount(getUnreadNotifications(data.notifications)), hint: 'teaching signals', accent: 'rgb(var(--brand-mint))' },
        ];
    }

    if (isBdeMembre(user)) {
        return [
            { label: 'Upcoming events', value: formatCount(getUpcomingEvents(data.events)), hint: 'scheduled this week', accent: 'rgb(var(--brand-gold))' },
            { label: 'Visible clubs', value: formatCount(data.clubsTotal), hint: 'community spaces', accent: 'rgb(var(--brand-violet))' },
            { label: 'Unread alerts', value: formatCount(getUnreadNotifications(data.notifications)), hint: 'community signals', accent: 'rgb(var(--brand-mint))' },
        ];
    }

    return [
        { label: 'Reputation', value: formatCount(data.score), hint: 'current score', accent: 'rgb(var(--brand-mint))' },
        { label: 'Unread alerts', value: formatCount(getUnreadNotifications(data.notifications)), hint: 'notification center', accent: 'rgb(var(--brand-violet))' },
        { label: 'Earned badges', value: formatCount(data.profile?.badges?.length), hint: 'visible proof', accent: 'rgb(var(--brand-gold))' },
    ];
}

function buildQueueItems(user, data) {
    if (isAdmin(user)) {
        return [
            ...data.blogs
                .filter((item) => item.status === 'pending')
                .slice(0, 3)
                .map((item) => ({
                    title: safeText(item.title),
                    label: 'Pending blog',
                    accent: '#FFD327',
                    href: `/app/blogs/${item.id}`,
                    helper: 'Review and approve',
                })),
            ...data.notifications.slice(0, 3).map((item) => ({
                title: safeText(item.title),
                label: item.type || 'Notification',
                accent: '#29CFFF',
                href: '/app/notifications',
                helper: item.is_read ? 'Read' : 'New',
            })),
            ...data.questions.slice(0, 2).map((item) => ({
                title: safeText(item.title),
                label: 'Latest question',
                accent: '#25F2A0',
                href: `/app/questions/${item.id}`,
                helper: item.status ? `Status: ${item.status}` : 'Open thread',
            })),
        ].slice(0, 6);
    }

    if (isFormateur(user)) {
        return [
            ...data.blogs
                .filter((item) => item.status === 'pending')
                .slice(0, 3)
                .map((item) => ({
                    title: safeText(item.title),
                    label: 'Moderation queue',
                    accent: '#FFD327',
                    href: `/app/blogs/${item.id}`,
                    helper: 'Approve or reject',
                })),
            ...data.questions.slice(0, 4).map((item) => ({
                title: safeText(item.title),
                label: 'Question to answer',
                accent: '#29CFFF',
                href: `/app/questions/${item.id}`,
                helper: item.status ? `Status: ${item.status}` : 'Needs guidance',
            })),
            ...data.notifications.slice(0, 2).map((item) => ({
                title: safeText(item.title),
                label: 'Alert',
                accent: '#25F2A0',
                href: '/app/notifications',
                helper: item.is_read ? 'Read' : 'New',
            })),
        ].slice(0, 6);
    }

    if (isBdeMembre(user)) {
        return [
            ...data.events.slice(0, 3).map((item) => ({
                title: safeText(item.title),
                label: item.status === 'upcoming' ? 'Upcoming event' : 'Event',
                accent: '#FF66D6',
                href: `/app/events/${item.id}`,
                helper: item.status ? `Status: ${item.status}` : 'Open event',
            })),
            ...data.clubs.slice(0, 3).map((item) => ({
                title: safeText(item.name),
                label: 'Club spotlight',
                accent: '#25F2A0',
                href: `/app/clubs/${item.id}`,
                helper: item.is_suspended ? 'Suspended' : 'Active',
            })),
            ...data.notifications.slice(0, 2).map((item) => ({
                title: safeText(item.title),
                label: 'Alert',
                accent: '#29CFFF',
                href: '/app/notifications',
                helper: item.is_read ? 'Read' : 'New',
            })),
        ].slice(0, 6);
    }

    return [
        ...data.questions.slice(0, 4).map((item) => ({
            title: safeText(item.title),
            label: 'Latest question',
            accent: '#29CFFF',
            href: `/app/questions/${item.id}`,
            helper: item.status ? `Status: ${item.status}` : 'Open thread',
        })),
        ...data.blogs
            .filter((item) => item.status === 'approved' || item.status === 'pending')
            .slice(0, 2)
            .map((item) => ({
                title: safeText(item.title),
                label: item.status === 'approved' ? 'Approved blog' : 'Blog pending',
                accent: '#FFD327',
                href: `/app/blogs/${item.id}`,
                helper: item.status === 'approved' ? 'Read it now' : 'In review',
            })),
        ...data.notifications.slice(0, 2).map((item) => ({
            title: safeText(item.title),
            label: 'Alert',
            accent: '#25F2A0',
            href: '/app/notifications',
            helper: item.is_read ? 'Read' : 'New',
        })),
    ].slice(0, 6);
}

function getRoleListItems(user, data) {
    if (isBdeMembre(user)) {
        const items = data.clubs.slice(0, 3).map((item) => item.name);
        if (items.length) {
            return items;
        }
    }

    const items = [
        ...(data.profile?.interests?.slice(0, 3).map((item) => item.name) || []),
        ...(data.profile?.badges?.slice(0, 3).map((item) => item.name) || []),
    ];

    return items.slice(0, 3);
}

function getRoleRailValue(user, data) {
    if (isAdmin(user)) {
        return `${formatCount(data.usersTotal)} users`;
    }

    if (isFormateur(user)) {
        return `${formatCount(getPendingBlogs(data.blogs))} pending`;
    }

    if (isBdeMembre(user)) {
        return `${formatCount(getUpcomingEvents(data.events))} upcoming`;
    }

    return `${formatCount(data.score)} score`;
}

function shouldShowUserIntelligence(user) {
    return isAdmin(user) || isFormateur(user);
}

export function StudentDashboardPage() {
    const { user } = useAuth();
    const dashboard = getDashboardContent(user);
    const dashboardData = useDashboardData(user);
    const stats = getRoleStats(user, dashboardData);
    const queueItems = buildQueueItems(user, dashboardData);
    const listItems = getRoleListItems(user, dashboardData);
    const railValue = getRoleRailValue(user, dashboardData);
    const unreadNotifications = dashboardData.notifications.filter((item) => !item.is_read).slice(0, 4);
    const showUserIntelligence = shouldShowUserIntelligence(user);

    if (dashboardData.isLoading) {
        return (
            <LoadingState
                eyebrow={dashboard.eyebrow}
                title="Loading your dashboard"
                description="We are pulling together your latest workspace data."
            />
        );
    }

    if (dashboardData.error) {
        return (
            <ErrorState
                eyebrow={dashboard.eyebrow}
                title="Dashboard temporarily unavailable"
                description={dashboardData.error}
                helperText="Refresh the page after the backend is running, or try signing out and in again."
            />
        );
    }

    return (
        <div className="grid gap-6">
            <SectionCard
                eyebrow={dashboard.eyebrow}
                title={dashboard.title}
                description={dashboard.description}
                className="hero-gradient overflow-hidden"
            >
                <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                    <div>
                        <div className="max-w-2xl">
                            <p className="inline-flex rounded-full bg-[#FFF3DC] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)]">
                                {dashboard.missionLabel}
                            </p>
                            <h3 className="mt-5 font-display text-5xl font-extrabold leading-none text-gradient">
                                {dashboard.missionTitle}
                            </h3>
                            <p className="mt-5 max-w-xl text-sm leading-7 text-[rgb(var(--fg-muted))]">
                                {dashboard.missionCopy}
                            </p>
                            <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-[#25F2A0]">
                                Signed in as {user?.name || 'User'} | {getRoleLabel(user)}
                            </p>
                        </div>
                        <div className="mt-8 grid gap-4 md:grid-cols-2">
                            {dashboard.actions.map((item) => (
                                <Link
                                    key={item.title}
                                    to={item.href}
                                    className={`festival-card ${item.tone} rounded-[2rem] border-2 p-5 text-black transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-black/60`}
                                >
                                    <p className="text-xs font-black uppercase tracking-[0.16em]">Quick action</p>
                                    <p className="mt-3 font-display text-3xl font-extrabold leading-none">{item.title}</p>
                                    <p className="mt-3 text-sm font-medium leading-6">{item.copy}</p>
                                    <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-black/70">Open</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-1">
                        {stats.map((item) => (
                            <StatCard key={item.label} {...item} />
                        ))}
                    </div>
                </div>
            </SectionCard>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <SectionCard
                    eyebrow="Queue"
                    title={dashboard.feedTitle}
                    description={dashboard.feedDescription}
                >
                    {queueItems.length ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {queueItems.map((item) => (
                                <Link
                                    key={`${item.href}-${item.title}`}
                                    to={item.href}
                                    className="festival-card group rounded-[2rem] border border-[rgb(var(--line))] bg-[rgb(var(--bg-panel))] p-5 transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand-mint))]/60"
                                >
                                    <div className="mb-4 h-3 w-20 rounded-full" style={{ backgroundColor: item.accent }} />
                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                                        {item.label}
                                    </p>
                                    <p className="mt-3 font-display text-2xl font-extrabold leading-none group-hover:text-[#25F2A0]">
                                        {item.title}
                                    </p>
                                    <div className="mt-4 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                                        <span>{item.helper}</span>
                                        <span className="rounded-full bg-white/10 px-3 py-1 text-[#FFF3DC]">Open</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="festival-card rounded-[2rem] border border-white/10 bg-[rgb(var(--bg-panel))] p-6">
                            <p className="text-sm font-bold text-[rgb(var(--fg))]">Nothing urgent right now.</p>
                            <p className="mt-2 text-sm leading-7 text-[rgb(var(--fg-muted))]">
                                Use the quick actions above to stay active: ask, publish, or explore what is new.
                            </p>
                        </div>
                    )}
                </SectionCard>

                <SectionCard
                    eyebrow="Right rail"
                    title={dashboard.railTitle}
                    description={dashboard.railDescription}
                >
                    <div className="grid gap-4">
                        <div className="festival-card rounded-[2rem] bg-[#0B0126] p-5 text-[#FFF3DC]">
                            <p className="text-sm uppercase tracking-[0.16em] text-[#25F2A0]">{dashboard.railLead}</p>
                            <p className="mt-3 font-display text-4xl font-extrabold">{railValue}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#FFF3DC]">
                                    {formatCount(getUnreadNotifications(dashboardData.notifications))} unread
                                </span>
                                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#FFF3DC]">
                                    {formatCount(getOpenQuestions(dashboardData.questions))} open questions
                                </span>
                            </div>
                        </div>
                        <div className="festival-card rounded-[2rem] bg-[rgb(var(--bg-panel))] p-5">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">
                                    New alerts
                                </p>
                                <Link
                                    to="/app/notifications"
                                    className="text-xs font-black uppercase tracking-[0.16em] text-[#25F2A0] hover:underline"
                                >
                                    Open
                                </Link>
                            </div>
                            {unreadNotifications.length ? (
                                <ul className="mt-4 grid gap-3 text-sm">
                                    {unreadNotifications.map((item) => (
                                        <li key={item.id} className="rounded-[1.25rem] border border-white/10 bg-[#0B0126] px-4 py-3">
                                            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFD327]">
                                                {safeText(item.type || 'Notification')}
                                            </p>
                                            <p className="mt-2 font-bold text-[#FFF3DC]">
                                                {safeText(item.title)}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-4 text-sm leading-7 text-[rgb(var(--fg-muted))]">
                                    You are all caught up. When something new happens, it will show here first.
                                </p>
                            )}
                        </div>
                        <div className="festival-card rounded-[2rem] bg-[rgb(var(--bg-panel))] p-5">
                            <p className="text-sm uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">{dashboard.listTitle}</p>
                            {listItems.length ? (
                                <ul className="mt-4 flex flex-wrap gap-2 text-sm">
                                    {listItems.map((item) => (
                                        <li
                                            key={item}
                                            className="rounded-full bg-white/60 px-4 py-2 font-bold text-black dark:bg-white/10 dark:text-[rgb(var(--fg))]"
                                        >
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-4 text-sm leading-7 text-[rgb(var(--fg-muted))]">
                                    Add interests or earn badges to personalize your experience.
                                </p>
                            )}
                        </div>
                    </div>
                </SectionCard>
            </div>

            {showUserIntelligence ? (
                <SectionCard
                    eyebrow="User stats"
                    title={isAdmin(user) ? 'Know the whole community' : 'Track learners across campuses'}
                    description={isAdmin(user)
                        ? 'Admins get a full platform view: roles, campuses, and reputation signals in one place.'
                        : 'Formateurs see students and BDE members only, with campus segmentation for mentorship.'}
                >
                    <UserIntelligenceTable
                        users={dashboardData.users || []}
                        mode={isAdmin(user) ? 'admin' : 'formateur'}
                        currentUserId={user?.id || null}
                    />
                </SectionCard>
            ) : null}
        </div>
    );
}
