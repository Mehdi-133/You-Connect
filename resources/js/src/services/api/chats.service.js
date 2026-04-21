import { apiClient } from './client';

export async function getChats(params = {}) {
    const { data } = await apiClient.get('/chats', { params });
    return data;
}

export async function createChat(payload) {
    const { data } = await apiClient.post('/chats', payload);
    return data;
}

export async function getChat(chatId) {
    const { data } = await apiClient.get(`/chats/${chatId}`);
    return data;
}

