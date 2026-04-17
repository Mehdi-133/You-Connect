import { apiClient } from './client';

export async function getNotifications(params = {}) {
    const { data } = await apiClient.get('/notifications', { params });
    return data;
}

export async function markNotificationAsRead(notificationId) {
    const { data } = await apiClient.patch(`/notifications/${notificationId}/read`);
    return data;
}

export async function markAllNotificationsAsRead() {
    const { data } = await apiClient.patch('/notifications/read-all');
    return data;
}

export async function deleteNotification(notificationId) {
    const { data } = await apiClient.delete(`/notifications/${notificationId}`);
    return data;
}

export async function deleteAllNotifications() {
    const { data } = await apiClient.delete('/notifications');
    return data;
}
