export function useAuth() {
    const token = localStorage.getItem('auth_token');

    return {
        isAuthenticated: Boolean(token),
    };
}
