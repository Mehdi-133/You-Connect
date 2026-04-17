import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

function getStoredUser() {
    const rawUser = localStorage.getItem('auth_user');

    if (!rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser);
    } catch {
        localStorage.removeItem('auth_user');
        return null;
    }
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
    const [user, setUser] = useState(() => getStoredUser());

    function signIn(session) {
        localStorage.setItem('auth_token', session.token);
        localStorage.setItem('auth_user', JSON.stringify(session.user));

        setToken(session.token);
        setUser(session.user);
    }

    function signOut() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        setToken(null);
        setUser(null);
    }

    const value = useMemo(() => ({
        token,
        user,
        isAuthenticated: Boolean(token && user),
        signIn,
        signOut,
    }), [token, user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuthContext must be used inside AuthProvider');
    }

    return context;
}
