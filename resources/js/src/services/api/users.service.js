import { apiClient } from './client';

export async function getUsers(params = {}) {
    const { data } = await apiClient.get('/users', { params });
    return data;
}

export async function getUser(userId) {
    const { data } = await apiClient.get(`/users/${userId}`);
    return data;
}

export async function updateUser(userId, payload) {
    const { data } = await apiClient.put(`/users/${userId}`, payload);
    return data;
}

export async function getUserScore(userId) {
    const { data } = await apiClient.get(`/users/${userId}/score`);
    return data;
}
