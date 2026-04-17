import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ isAllowed, redirectTo = '/sign-in', children }) {
    if (!isAllowed) {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
}
