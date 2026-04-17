import { apiClient } from './client';

export async function getEvents(params = {}) {
    const { data } = await apiClient.get('/events', { params });
    return data;
}

export async function getEvent(eventId) {
    const { data } = await apiClient.get(`/events/${eventId}`);
    return data;
}
