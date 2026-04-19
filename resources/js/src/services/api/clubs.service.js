import { apiClient } from './client';

export async function getClubs(params = {}) {
    const { data } = await apiClient.get('/clubs', { params });
    return data;
}

export async function getClub(clubId) {
    const { data } = await apiClient.get(`/clubs/${clubId}`);
    return data;
}

export async function createClub(payload) {
    const { data } = await apiClient.post('/clubs', payload);
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

export async function updateClub(clubId, payload) {
    const { data } = await apiClient.put(`/clubs/${clubId}`, payload);
    return data;
}

export async function deleteClub(clubId) {
    const { data } = await apiClient.delete(`/clubs/${clubId}`);
    return data;
}

export async function inviteClubMember(clubId, userId) {
    const { data } = await apiClient.post(`/clubs/${clubId}/invite`, { user_id: userId });
    return data;
}

export async function removeClubMember(clubId, userId) {
    const { data } = await apiClient.delete(`/clubs/${clubId}/members`, {
        data: { user_id: userId },
    });
    return data;
}

export async function changeClubMemberRole(clubId, userId, role) {
    const { data } = await apiClient.patch(`/clubs/${clubId}/members/role`, {
        user_id: userId,
        role,
    });
    return data;
}

export async function suspendClub(clubId) {
    const { data } = await apiClient.patch(`/clubs/${clubId}/suspend`);
    return data;
}

export async function restoreClub(clubId) {
    const { data } = await apiClient.patch(`/clubs/${clubId}/restore`);
    return data;
}
