import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MarketingLayout } from '../shared/layouts/MarketingLayout';
import { AppLayout } from '../shared/layouts/AppLayout';
import { LandingPage } from '../features/marketing/pages/LandingPage';
import { SignInPage } from '../features/auth/pages/SignInPage';
import { SignUpPage } from '../features/auth/pages/SignUpPage';
import { StudentDashboardPage } from '../features/dashboard/pages/StudentDashboardPage';
import { QuestionsPage } from '../features/questions/pages/QuestionsPage';
import { QuestionDetailsPage } from '../features/questions/pages/QuestionDetailsPage';
import { BlogsPage } from '../features/blogs/pages/BlogsPage';
import { BlogDetailsPage } from '../features/blogs/pages/BlogDetailsPage';
import { ClubsPage } from '../features/clubs/pages/ClubsPage';
import { ClubDetailsPage } from '../features/clubs/pages/ClubDetailsPage';
import { EventsPage } from '../features/events/pages/EventsPage';
import { EventDetailsPage } from '../features/events/pages/EventDetailsPage';
import { NotificationsPage } from '../features/notifications/pages/NotificationsPage';
import { ProfilePage } from '../features/profile/pages/ProfilePage';
import { BadgeInterestAdminPage } from '../features/admin/pages/BadgeInterestAdminPage';
import { TagAdminPage } from '../features/admin/pages/TagAdminPage';
import { ProtectedRoute } from './ProtectedRoute';
import { isAdmin } from '../shared/utils/roles';

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
                <Route path="/app" element={<StudentDashboardPage />} />
                <Route path="/app/questions" element={<QuestionsPage />} />
                <Route path="/app/questions/:questionId" element={<QuestionDetailsPage />} />
                <Route path="/app/blogs" element={<BlogsPage />} />
                <Route path="/app/blogs/:blogId" element={<BlogDetailsPage />} />
                <Route path="/app/clubs" element={<ClubsPage />} />
                <Route path="/app/clubs/:clubId" element={<ClubDetailsPage />} />
                <Route path="/app/events" element={<EventsPage />} />
                <Route path="/app/events/:eventId" element={<EventDetailsPage />} />
                <Route path="/app/notifications" element={<NotificationsPage />} />
                <Route path="/app/profile" element={<ProfilePage />} />
                <Route
                    path="/app/admin/badges-interests"
                    element={( 
                        <ProtectedRoute isAllowed={isAdmin(user)}>
                            <BadgeInterestAdminPage />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/app/admin/tags"
                    element={( 
                        <ProtectedRoute isAllowed={isAdmin(user)}>
                            <TagAdminPage />
                        </ProtectedRoute>
                    )}
                />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
