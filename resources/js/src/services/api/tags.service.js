import { apiClient } from './client';

export async function getTags(params = {}) {
    const { data } = await apiClient.get('/tags', { params });
    return data;
}
