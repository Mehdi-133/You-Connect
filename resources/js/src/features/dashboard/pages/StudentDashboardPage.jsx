import { SectionCard } from '../../../shared/components/SectionCard';
import { StatCard } from '../../../shared/components/StatCard';
import { useAuth } from '../../../hooks/useAuth';
import { getRoleLabel, isAdmin, isBdeMembre, isFormateur } from '../../../shared/utils/roles';
import { useDashboardData } from '../hooks/useDashboardData';
import { ErrorState } from '../../../shared/ui/feedback/ErrorState';
import { LoadingState } from '../../../shared/ui/feedback/LoadingState';

const DASHBOARD_CONTENT = {
    student: {
        eyebrow: 'Student dashboard',
        title: 'Your learning arena is live.',
        description: 'Focus on answering, publishing, collecting reputation, and staying active in the community.',
        missionLabel: 'Daily mission',
        missionTitle: 'Answer, publish, collect proof of growth.',
        missionCopy: 'This student view should help you move fast between learning goals, questions, blogs, and events.',
        stats: [
            { label: 'Reputation', value: '1,280', hint: 'current score', accent: 'rgb(var(--brand-mint))' },
            { label: 'Unread alerts', value: '12', hint: 'notification center', accent: 'rgb(var(--brand-violet))' },
            { label: 'Questions solved', value: '34', hint: 'community impact', accent: 'rgb(var(--brand-gold))' },
        ],
        actions: [
            { title: 'Ask a question', tone: 'bg-[#29CFFF]', copy: 'Open a clean ask flow with tags, hints, and community prompts.' },
            { title: 'Write a blog', tone: 'bg-[#FFD327]', copy: 'Draft a story-driven blog card with moderation status built in.' },
            { title: 'Review alerts', tone: 'bg-[#25F2A0]', copy: 'Surface accepted answers, votes, and approvals in one place.' },
            { title: 'Join events', tone: 'bg-[#FF66D6]', copy: 'Push clubs, hackathons, and workshops with poster-like cards.' },
        ],
        feedTitle: 'What students should do first',
        feedDescription: 'The next round will replace this with API data, but the screen already points learners to the most useful areas.',
        feedItems: [
            ['Frontend Builders', 'Recommended club', '#29CFFF'],
            ['New answers on Laravel auth', 'Hot discussion', '#25F2A0'],
            ['Write your first approved blog', 'Growth quest', '#FFD327'],
            ['Hack Night starts at 18:00', 'Upcoming event', '#FF66D6'],
        ],
        railTitle: 'Progress and activity',
        railDescription: 'This rail keeps the growth feeling visible: streaks, clubs, and earned proof.',
        railLead: 'Current streak',
        railValue: '6 days',
        listTitle: 'Recommended clubs',
        listItems: ['Frontend Builders', 'AI Tinker Lab', 'Hack Night Circle'],
    },
    formateur: {
        eyebrow: 'Formateur dashboard',
        title: 'Guide the learning flow.',
        description: 'Your dashboard should make moderation, student support, and knowledge quality easier to manage.',
        missionLabel: 'Focus today',
        missionTitle: 'Review, approve, unblock, and mentor.',
        missionCopy: 'This view brings together the spaces where a formateur creates momentum for the whole learning community.',
        stats: [
            { label: 'Pending blogs', value: '9', hint: 'awaiting review', accent: 'rgb(var(--brand-gold))' },
            { label: 'Open questions', value: '18', hint: 'students need guidance', accent: 'rgb(var(--brand-violet))' },
            { label: 'Accepted answers', value: '57', hint: 'quality signals', accent: 'rgb(var(--brand-mint))' },
        ],
        actions: [
            { title: 'Review blogs', tone: 'bg-[#FFD327]', copy: 'Approve, reject, and improve the content pipeline.' },
            { title: 'Answer questions', tone: 'bg-[#29CFFF]', copy: 'Jump into active threads where students are blocked.' },
            { title: 'Manage tags', tone: 'bg-[#25F2A0]', copy: 'Keep the knowledge taxonomy clean and teachable.' },
            { title: 'Track progress', tone: 'bg-[#FF66D6]', copy: 'Spot high performers and learners who need support.' },
        ],
        feedTitle: 'What formateurs should do first',
        feedDescription: 'Use the dashboard as a teaching control room: triage content, answer blockers, and keep signals healthy.',
        feedItems: [
            ['Three blogs waiting for approval', 'Moderation queue', '#FFD327'],
            ['Auth debugging thread needs a reply', 'Priority question', '#29CFFF'],
            ['Students asking for new web tags', 'Taxonomy update', '#25F2A0'],
            ['Weekly mentoring event opens today', 'Community follow-up', '#FF66D6'],
        ],
        railTitle: 'Teaching rhythm',
        railDescription: 'A quick side rail for review pace, mentoring focus, and active learning groups.',
        railLead: 'Review pace',
        railValue: '68% cleared',
        listTitle: 'Groups to check in with',
        listItems: ['Backend Cohort', 'React Builders', 'API Design Lab'],
    },
    admin: {
        eyebrow: 'Admin dashboard',
        title: 'Steer the platform with clarity.',
        description: 'Use this home screen to monitor users, moderation, reputation signals, and overall platform health.',
        missionLabel: 'Control center',
        missionTitle: 'Protect quality, enable people, and unblock operations.',
        missionCopy: 'This admin view should highlight the biggest management actions first and keep platform-wide work visible.',
        stats: [
            { label: 'Active users', value: '246', hint: 'current workspace', accent: 'rgb(var(--brand-mint))' },
            { label: 'Flags to review', value: '7', hint: 'needs admin attention', accent: 'rgb(var(--brand-violet))' },
            { label: 'Pending approvals', value: '14', hint: 'content pipeline', accent: 'rgb(var(--brand-gold))' },
        ],
        actions: [
            { title: 'Manage users', tone: 'bg-[#29CFFF]', copy: 'Inspect roles, statuses, and access across the platform.' },
            { title: 'Assign badges', tone: 'bg-[#FFD327]', copy: 'Reward contribution and keep recognition visible.' },
            { title: 'Review moderation', tone: 'bg-[#25F2A0]', copy: 'Keep blogs, comments, and community signals healthy.' },
            { title: 'Tune taxonomy', tone: 'bg-[#FF66D6]', copy: 'Manage tags and structure for better discovery.' },
        ],
        feedTitle: 'What admins should do first',
        feedDescription: 'This admin feed should stay focused on risk, approvals, and the parts of the product that need decisive action.',
        feedItems: [
            ['Two users need status review', 'User management', '#29CFFF'],
            ['Badge assignment batch pending', 'Recognition queue', '#FFD327'],
            ['Moderation report from blogs', 'Platform health', '#25F2A0'],
            ['Tag cleanup suggested by formateurs', 'Taxonomy review', '#FF66D6'],
        ],
        railTitle: 'Platform snapshot',
        railDescription: 'A compact right rail to keep system-wide momentum visible without leaving the dashboard.',
        railLead: 'Governance pulse',
        railValue: 'Stable',
        listTitle: 'Watch areas',
        listItems: ['User access', 'Content moderation', 'Tag quality'],
    },
    bde_membre: {
        eyebrow: 'BDE dashboard',
        title: 'Keep the community moving.',
        description: 'This version of the dashboard should help BDE members promote events, clubs, and visible campus energy.',
        missionLabel: 'Community pulse',
        missionTitle: 'Launch events, grow clubs, and keep students engaged.',
        missionCopy: 'Use this home view to push momentum through clubs, workshops, campaigns, and campus activities.',
        stats: [
            { label: 'Upcoming events', value: '5', hint: 'scheduled this week', accent: 'rgb(var(--brand-gold))' },
            { label: 'Club requests', value: '4', hint: 'waiting review', accent: 'rgb(var(--brand-violet))' },
            { label: 'New joins', value: '31', hint: 'community growth', accent: 'rgb(var(--brand-mint))' },
        ],
        actions: [
            { title: 'Promote an event', tone: 'bg-[#FF66D6]', copy: 'Highlight hack nights, workshops, and student experiences.' },
            { title: 'Manage clubs', tone: 'bg-[#25F2A0]', copy: 'Keep clubs active, visible, and welcoming.' },
            { title: 'Share highlights', tone: 'bg-[#FFD327]', copy: 'Push stories that make the campus community feel alive.' },
            { title: 'Review notifications', tone: 'bg-[#29CFFF]', copy: 'Track event joins, club updates, and momentum signals.' },
        ],
        feedTitle: 'What BDE members should do first',
        feedDescription: 'This feed keeps community-building work at the center: events, clubs, and visible activity.',
        feedItems: [
            ['Hack Night poster needs publishing', 'Event push', '#FF66D6'],
            ['Robotics club requested support', 'Club coordination', '#25F2A0'],
            ['Workshop speaker confirmed', 'Community milestone', '#FFD327'],
            ['Student requests new event calendar', 'Feedback signal', '#29CFFF'],
        ],
        railTitle: 'Community momentum',
        railDescription: 'Track attendance energy, club health, and what needs extra promotion this week.',
        railLead: 'Event energy',
        railValue: 'High',
        listTitle: 'Clubs to spotlight',
        listItems: ['Frontend Builders', 'Robotics Crew', 'Creative Media Hub'],
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

function getRoleFeedItems(user, data) {
    if (isAdmin(user)) {
        const adminItems = [
            ...data.notifications.slice(0, 2).map((item) => [item.title, item.type || 'Notification', '#29CFFF']),
            ...data.blogs.filter((item) => item.status === 'pending').slice(0, 2).map((item) => [item.title, 'Pending blog', '#FFD327']),
        ];

        return adminItems.length ? adminItems : DASHBOARD_CONTENT.admin.feedItems;
    }

    if (isFormateur(user)) {
        const formateurItems = [
            ...data.blogs.filter((item) => item.status === 'pending').slice(0, 2).map((item) => [item.title, 'Moderation queue', '#FFD327']),
            ...data.questions.slice(0, 2).map((item) => [item.title, 'Question to review', '#29CFFF']),
        ];

        return formateurItems.length ? formateurItems : DASHBOARD_CONTENT.formateur.feedItems;
    }

    if (isBdeMembre(user)) {
        const bdeItems = [
            ...data.events.slice(0, 2).map((item) => [item.title, 'Upcoming event', '#FF66D6']),
            ...data.clubs.slice(0, 2).map((item) => [item.name, 'Active club', '#25F2A0']),
        ];

        return bdeItems.length ? bdeItems : DASHBOARD_CONTENT.bde_membre.feedItems;
    }

    const studentItems = [
        ...data.questions.slice(0, 2).map((item) => [item.title, 'Latest question', '#29CFFF']),
        ...data.blogs.slice(0, 2).map((item) => [item.title, item.status === 'approved' ? 'Approved blog' : 'Blog in progress', '#FFD327']),
    ];

    return studentItems.length ? studentItems : DASHBOARD_CONTENT.student.feedItems;
}

function getRoleListItems(user, data) {
    if (isAdmin(user)) {
        const items = data.notifications.slice(0, 3).map((item) => item.title);
        return items.length ? items : DASHBOARD_CONTENT.admin.listItems;
    }

    if (isFormateur(user)) {
        const items = data.questions.slice(0, 3).map((item) => item.title);
        return items.length ? items : DASHBOARD_CONTENT.formateur.listItems;
    }

    if (isBdeMembre(user)) {
        const items = data.clubs.slice(0, 3).map((item) => item.name);
        return items.length ? items : DASHBOARD_CONTENT.bde_membre.listItems;
    }

    const items = [
        ...(data.profile?.interests?.slice(0, 3).map((item) => item.name) || []),
        ...(data.profile?.badges?.slice(0, 3).map((item) => item.name) || []),
    ];

    return items.length ? items.slice(0, 3) : DASHBOARD_CONTENT.student.listItems;
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

export function StudentDashboardPage() {
    const { user } = useAuth();
    const dashboard = getDashboardContent(user);
    const dashboardData = useDashboardData(user);
    const stats = getRoleStats(user, dashboardData);
    const feedItems = getRoleFeedItems(user, dashboardData);
    const listItems = getRoleListItems(user, dashboardData);
    const railValue = getRoleRailValue(user, dashboardData);

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
                                <div key={item.title} className={`festival-card ${item.tone} rounded-[2rem] border-2 p-5 text-black`}>
                                    <p className="text-xs font-black uppercase tracking-[0.16em]">Quick action</p>
                                    <p className="mt-3 font-display text-3xl font-extrabold leading-none">{item.title}</p>
                                    <p className="mt-3 text-sm font-medium leading-6">{item.copy}</p>
                                </div>
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
                    eyebrow="Live feed"
                    title={dashboard.feedTitle}
                    description={dashboard.feedDescription}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        {feedItems.map(([item, label, color]) => (
                            <div key={item} className="festival-card rounded-[2rem] border border-[rgb(var(--line))] bg-[rgb(var(--bg-panel))] p-5">
                                <div className="mb-4 h-3 w-20 rounded-full" style={{ backgroundColor: color }} />
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">{label}</p>
                                <p className="mt-3 font-display text-2xl font-extrabold leading-none">{item}</p>
                                <p className="mt-3 text-sm leading-7 text-[rgb(var(--fg-muted))]">
                                    This card will become a reusable CTA pattern across the app.
                                </p>
                            </div>
                        ))}
                    </div>
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
                            <div className="mt-4 h-3 rounded-full bg-white/10">
                                <div className="h-3 w-2/3 rounded-full bg-[linear-gradient(90deg,#A34DFF_0%,#29CFFF_40%,#25F2A0_100%)]" />
                            </div>
                        </div>
                        <div className="festival-card rounded-[2rem] bg-[rgb(var(--bg-panel))] p-5">
                            <p className="text-sm uppercase tracking-[0.16em] text-[rgb(var(--fg-muted))]">{dashboard.listTitle}</p>
                            <ul className="mt-4 grid gap-3 text-sm">
                                {listItems.map((item) => (
                                    <li
                                        key={item}
                                        className="rounded-full bg-white/60 px-4 py-2 font-bold text-black dark:bg-white/10 dark:text-[rgb(var(--fg))]"
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}
