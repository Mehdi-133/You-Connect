import { apiClient } from './client';

export async function getClubs(params = {}) {
    const { data } = await apiClient.get('/clubs', { params });
    return data;
}

export async function getClub(clubId) {
    const { data } = await apiClient.get(`/clubs/${clubId}`);
    return data;
}

export async function joinClub(clubId) {
    const { data } = await apiClient.post(`/clubs/${clubId}/join`);
    return data;
}

export async function leaveClub(clubId) {
    const { data } = await apiClient.delete(`/clubs/${clubId}/leave`);
    return data;
}
