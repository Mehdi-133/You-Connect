import { apiClient } from './client';

export async function login(payload) {
    const { data } = await apiClient.post('/login', payload);
    return data;
}

export async function register(payload) {
    const { data } = await apiClient.post('/register', payload);
    return data;
}

export async function logout() {
    const { data } = await apiClient.delete('/logout');
    return data;
}
