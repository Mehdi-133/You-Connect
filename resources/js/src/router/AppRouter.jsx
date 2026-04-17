import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MarketingLayout } from '../shared/layouts/MarketingLayout';
import { AppLayout } from '../shared/layouts/AppLayout';
import { LandingPage } from '../features/marketing/pages/LandingPage';
import { SignInPage } from '../features/auth/pages/SignInPage';
import { SignUpPage } from '../features/auth/pages/SignUpPage';
import { StudentDashboardPage } from '../features/dashboard/pages/StudentDashboardPage';
import { QuestionsPage } from '../features/questions/pages/QuestionsPage';
import { BlogsPage } from '../features/blogs/pages/BlogsPage';
import { NotificationsPage } from '../features/notifications/pages/NotificationsPage';
import { ProfilePage } from '../features/profile/pages/ProfilePage';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRouter() {
    const { isAuthenticated } = useAuth();

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
                <Route path="/app/blogs" element={<BlogsPage />} />
                <Route path="/app/notifications" element={<NotificationsPage />} />
                <Route path="/app/profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
