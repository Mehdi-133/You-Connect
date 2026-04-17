import { apiClient } from './client';

export async function getBlogs(params = {}) {
    const { data } = await apiClient.get('/blogs', { params });
    return data;
}

export async function getBlog(blogId) {
    const { data } = await apiClient.get(`/blogs/${blogId}`);
    return data;
}

export async function createBlog(payload) {
    const { data } = await apiClient.post('/blogs', payload);
    return data;
}

export async function updateBlog(blogId, payload) {
    const { data } = await apiClient.put(`/blogs/${blogId}`, payload);
    return data;
}

export async function likeBlog(payload) {
    const { data } = await apiClient.post('/likes', payload);
    return data;
}

export async function approveBlog(blogId) {
    const { data } = await apiClient.patch(`/blogs/${blogId}/approve`);
    return data;
}

export async function rejectBlog(blogId) {
    const { data } = await apiClient.patch(`/blogs/${blogId}/reject`);
    return data;
}

export async function highlightBlog(blogId) {
    const { data } = await apiClient.patch(`/blogs/${blogId}/highlight`);
    return data;
}
