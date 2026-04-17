import { apiClient } from './client';

export async function getClubs(params = {}) {
    const { data } = await apiClient.get('/clubs', { params });
    return data;
}

export async function getClub(clubId) {
    const { data } = await apiClient.get(`/clubs/${clubId}`);
    return data;
}
