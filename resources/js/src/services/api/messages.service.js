import { apiClient } from './client';

export async function getChatMessages(chatId, params = {}) {
    const { data } = await apiClient.get(`/chats/${chatId}/messages`, { params });
    return data;
}

export async function sendChatMessage(chatId, payload) {
    const { data } = await apiClient.post(`/chats/${chatId}/messages`, payload);
    return data;
}

export async function updateMessage(messageId, payload) {
    const { data } = await apiClient.put(`/messages/${messageId}`, payload);
    return data;
}

export async function deleteMessage(messageId) {
    const { data } = await apiClient.delete(`/messages/${messageId}`);
    return data;
}

