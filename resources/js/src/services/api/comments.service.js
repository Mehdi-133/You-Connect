import { apiClient } from './client';

export async function createComment(payload) {
    const { data } = await apiClient.post('/comments', payload);
    return data;
}

export async function updateComment(commentId, payload) {
    const { data } = await apiClient.put(`/comments/${commentId}`, payload);
    return data;
}

export async function deleteComment(commentId) {
    const { data } = await apiClient.delete(`/comments/${commentId}`);
    return data;
}
