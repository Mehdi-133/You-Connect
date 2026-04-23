// Central place to define route chunk imports so we can reuse them for:
// - React.lazy() in AppRouter
// - Prefetch-on-hover in AppLayout

export const routeChunks = {
    dashboard: () => import('../features/dashboard/pages/StudentDashboardPage'),
    questions: () => import('../features/questions/pages/QuestionsPage'),
    questionDetails: () => import('../features/questions/pages/QuestionDetailsPage'),
    blogs: () => import('../features/blogs/pages/BlogsPage'),
    blogDetails: () => import('../features/blogs/pages/BlogDetailsPage'),
    clubs: () => import('../features/clubs/pages/ClubsPage'),
    clubDetails: () => import('../features/clubs/pages/ClubDetailsPage'),
    events: () => import('../features/events/pages/EventsPage'),
    eventDetails: () => import('../features/events/pages/EventDetailsPage'),
    eventManage: () => import('../features/events/pages/EventManagePage'),
    notifications: () => import('../features/notifications/pages/NotificationsPage'),
    profile: () => import('../features/profile/pages/ProfilePage'),
    chats: () => import('../features/chats/pages/ChatsPage'),
    chatThread: () => import('../features/chats/pages/ChatThreadPage'),
    adminBadgesInterests: () => import('../features/admin/pages/BadgeInterestAdminPage'),
    adminTags: () => import('../features/admin/pages/TagAdminPage'),
    adminUsers: () => import('../features/admin/pages/UserAdminPage'),
};

export function prefetchRouteChunk(pathname) {
    if (!pathname) {
        return;
    }

    if (pathname === '/app') return void routeChunks.dashboard();
    if (pathname.startsWith('/app/questions/')) return void routeChunks.questionDetails();
    if (pathname === '/app/questions') return void routeChunks.questions();
    if (pathname.startsWith('/app/blogs/')) return void routeChunks.blogDetails();
    if (pathname === '/app/blogs') return void routeChunks.blogs();
    if (pathname.startsWith('/app/clubs/')) return void routeChunks.clubDetails();
    if (pathname === '/app/clubs') return void routeChunks.clubs();
    if (pathname.startsWith('/app/events/') && pathname.endsWith('/manage')) return void routeChunks.eventManage();
    if (pathname.startsWith('/app/events/')) return void routeChunks.eventDetails();
    if (pathname === '/app/events') return void routeChunks.events();
    if (pathname === '/app/notifications') return void routeChunks.notifications();
    if (pathname === '/app/profile') return void routeChunks.profile();
    if (pathname.startsWith('/app/chats/')) return void routeChunks.chatThread();
    if (pathname === '/app/chats') return void routeChunks.chats();
    if (pathname === '/app/admin/badges-interests') return void routeChunks.adminBadgesInterests();
    if (pathname === '/app/admin/tags') return void routeChunks.adminTags();
    if (pathname === '/app/admin/users') return void routeChunks.adminUsers();
}
