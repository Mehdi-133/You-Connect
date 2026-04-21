import { apiClient } from './client';

export async function getTags(params = {}) {
    const { data } = await apiClient.get('/tags', { params });
    return data;
}

export async function createTag(payload) {
    const { data } = await apiClient.post('/tags', payload);
    return data;
}

export async function updateTag(tagId, payload) {
    const { data } = await apiClient.put(`/tags/${tagId}`, payload);
    return data;
}

export async function deleteTag(tagId) {
    const { data } = await apiClient.delete(`/tags/${tagId}`);
    return data;
}
