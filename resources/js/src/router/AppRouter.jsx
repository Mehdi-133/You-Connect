import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MarketingLayout } from '../shared/layouts/MarketingLayout';
import { AppLayout } from '../shared/layouts/AppLayout';
import { LandingPage } from '../features/marketing/pages/LandingPage';
import { SignInPage } from '../features/auth/pages/SignInPage';
import { SignUpPage } from '../features/auth/pages/SignUpPage';
import { ProtectedRoute } from './ProtectedRoute';
import { isAdmin } from '../shared/utils/roles';
import { routeChunks } from './routeChunks';

function lazyNamed(factory, exportName) {
    return lazy(() => factory().then((module) => ({ default: module[exportName] })));
}

const StudentDashboardPage = lazyNamed(routeChunks.dashboard, 'StudentDashboardPage');
const QuestionsPage = lazyNamed(routeChunks.questions, 'QuestionsPage');
const QuestionDetailsPage = lazyNamed(routeChunks.questionDetails, 'QuestionDetailsPage');
const BlogsPage = lazyNamed(routeChunks.blogs, 'BlogsPage');
const BlogDetailsPage = lazyNamed(routeChunks.blogDetails, 'BlogDetailsPage');
const ClubsPage = lazyNamed(routeChunks.clubs, 'ClubsPage');
const ClubDetailsPage = lazyNamed(routeChunks.clubDetails, 'ClubDetailsPage');
const EventsPage = lazyNamed(routeChunks.events, 'EventsPage');
const EventDetailsPage = lazyNamed(routeChunks.eventDetails, 'EventDetailsPage');
const EventManagePage = lazyNamed(routeChunks.eventManage, 'EventManagePage');
const NotificationsPage = lazyNamed(routeChunks.notifications, 'NotificationsPage');
const ProfilePage = lazyNamed(routeChunks.profile, 'ProfilePage');
const ChatsPage = lazyNamed(routeChunks.chats, 'ChatsPage');
const ChatThreadPage = lazyNamed(routeChunks.chatThread, 'ChatThreadPage');
const BadgeInterestAdminPage = lazyNamed(routeChunks.adminBadgesInterests, 'BadgeInterestAdminPage');
const TagAdminPage = lazyNamed(routeChunks.adminTags, 'TagAdminPage');
const UserAdminPage = lazyNamed(routeChunks.adminUsers, 'UserAdminPage');

function RouteFallback() {
    return (
        <div className="grid gap-4">
            <div className="h-7 w-48 rounded-full bg-white/10" />
            <div className="h-12 w-full max-w-[680px] rounded-[1.6rem] bg-white/5" />
            <div className="grid gap-3">
                <div className="h-28 rounded-[1.6rem] border border-white/10 bg-white/5" />
                <div className="h-28 rounded-[1.6rem] border border-white/10 bg-white/5" />
                <div className="h-28 rounded-[1.6rem] border border-white/10 bg-white/5" />
            </div>
        </div>
    );
}

export function AppRouter() {
    const { isAuthenticated, user } = useAuth();

    return (
        <Routes>
            <Route element={<MarketingLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route
                    path="/sign-in"
                    element={isAuthenticated ? <Navigate to="/app" replace /> : <SignInPage />}
                />
                <Route
                    path="/sign-up"
                    element={isAuthenticated ? <Navigate to="/app" replace /> : <SignUpPage />}
                />
            </Route>

            <Route
                element={(
                    <ProtectedRoute isAllowed={isAuthenticated}>
                        <AppLayout />
                    </ProtectedRoute>
                )}
            >
                <Route path="/app" element={<Suspense fallback={<RouteFallback />}><StudentDashboardPage /></Suspense>} />
                <Route path="/app/questions" element={<Suspense fallback={<RouteFallback />}><QuestionsPage /></Suspense>} />
                <Route path="/app/questions/:questionId" element={<Suspense fallback={<RouteFallback />}><QuestionDetailsPage /></Suspense>} />
                <Route path="/app/blogs" element={<Suspense fallback={<RouteFallback />}><BlogsPage /></Suspense>} />
                <Route path="/app/blogs/:blogId" element={<Suspense fallback={<RouteFallback />}><BlogDetailsPage /></Suspense>} />
                <Route path="/app/clubs" element={<Suspense fallback={<RouteFallback />}><ClubsPage /></Suspense>} />
                <Route path="/app/clubs/:clubId" element={<Suspense fallback={<RouteFallback />}><ClubDetailsPage /></Suspense>} />
                <Route path="/app/events" element={<Suspense fallback={<RouteFallback />}><EventsPage /></Suspense>} />
                <Route path="/app/events/:eventId" element={<Suspense fallback={<RouteFallback />}><EventDetailsPage /></Suspense>} />
                <Route path="/app/events/:eventId/manage" element={<Suspense fallback={<RouteFallback />}><EventManagePage /></Suspense>} />
                <Route path="/app/notifications" element={<Suspense fallback={<RouteFallback />}><NotificationsPage /></Suspense>} />
                <Route path="/app/profile" element={<Suspense fallback={<RouteFallback />}><ProfilePage /></Suspense>} />
                <Route path="/app/chats" element={<Suspense fallback={<RouteFallback />}><ChatsPage /></Suspense>} />
                <Route path="/app/chats/:chatId" element={<Suspense fallback={<RouteFallback />}><ChatThreadPage /></Suspense>} />
                <Route
                    path="/app/admin/badges-interests"
                    element={( 
                        <ProtectedRoute isAllowed={isAdmin(user)}>
                            <Suspense fallback={<RouteFallback />}><BadgeInterestAdminPage /></Suspense>
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/app/admin/tags"
                    element={( 
                        <ProtectedRoute isAllowed={isAdmin(user)}>
                            <Suspense fallback={<RouteFallback />}><TagAdminPage /></Suspense>
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/app/admin/users"
                    element={( 
                        <ProtectedRoute isAllowed={isAdmin(user)}>
                            <Suspense fallback={<RouteFallback />}><UserAdminPage /></Suspense>
                        </ProtectedRoute>
                    )}
                />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
