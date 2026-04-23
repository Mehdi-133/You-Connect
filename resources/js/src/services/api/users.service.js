import { apiClient } from './client';

export async function getUsers(params = {}) {
    const { data } = await apiClient.get('/users', { params });
    return data;
}

export async function inviteUser(payload) {
    const { data } = await apiClient.post('/users', payload);
    return data;
}

export async function getUser(userId) {
    const { data } = await apiClient.get(`/users/${userId}`);
    return data;
}

export async function banUser(userId) {
    const { data } = await apiClient.patch(`/users/${userId}/ban`);
    return data;
}

export async function restoreUser(userId) {
    const { data } = await apiClient.patch(`/users/${userId}/restore`);
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

export async function getInterests(params = {}) {
    const { data } = await apiClient.get('/interests', { params });
    return data;
}

export async function addUserInterest(userId, interestId) {
    const { data } = await apiClient.post(`/users/${userId}/interests/${interestId}`);
    return data;
}

export async function removeUserInterest(userId, interestId) {
    const { data } = await apiClient.delete(`/users/${userId}/interests/${interestId}`);
    return data;
}

export async function getBadges(params = {}) {
    const { data } = await apiClient.get('/badges', { params });
    return data;
}

export async function assignUserBadge(userId, badgeId) {
    const { data } = await apiClient.post(`/users/${userId}/badges/${badgeId}`);
    return data;
}

export async function revokeUserBadge(userId, badgeId) {
    const { data } = await apiClient.delete(`/users/${userId}/badges/${badgeId}`);
    return data;
}

export async function createBadge(payload) {
    const { data } = await apiClient.post('/badges', payload);
    return data;
}

export async function updateBadge(badgeId, payload) {
    const { data } = await apiClient.put(`/badges/${badgeId}`, payload);
    return data;
}

export async function deleteBadge(badgeId) {
    const { data } = await apiClient.delete(`/badges/${badgeId}`);
    return data;
}

export async function createInterest(payload) {
    const { data } = await apiClient.post('/interests', payload);
    return data;
}

export async function updateInterest(interestId, payload) {
    const { data } = await apiClient.put(`/interests/${interestId}`, payload);
    return data;
}

export async function deleteInterest(interestId) {
    const { data } = await apiClient.delete(`/interests/${interestId}`);
    return data;
}
