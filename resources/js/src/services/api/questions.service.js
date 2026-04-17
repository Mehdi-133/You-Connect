import { apiClient } from './client';

export async function getQuestions(params = {}) {
    const { data } = await apiClient.get('/questions', { params });
    return data;
}

export async function getQuestion(questionId) {
    const { data } = await apiClient.get(`/questions/${questionId}`);
    return data;
}

export async function createQuestion(payload) {
    const { data } = await apiClient.post('/questions', payload);
    return data;
}

export async function updateQuestion(questionId, payload) {
    const { data } = await apiClient.put(`/questions/${questionId}`, payload);
    return data;
}

export async function getQuestionAnswers(questionId) {
    const { data } = await apiClient.get(`/questions/${questionId}/answers`);
    return data;
}

export async function createAnswer(payload) {
    const { data } = await apiClient.post('/answers', payload);
    return data;
}

export async function acceptAnswer(answerId) {
    const { data } = await apiClient.patch(`/answers/${answerId}/accept`);
    return data;
}

export async function voteAnswer(payload) {
    const { data } = await apiClient.post('/votes', payload);
    return data;
}
