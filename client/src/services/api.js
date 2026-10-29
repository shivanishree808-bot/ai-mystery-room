import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    timeout: 90000, // mystery generation can take a while
});

// Turns any error into a message that is safe to show the player
export function getErrorMessage(error) {
    if (error.response && error.response.data && error.response.data.error) {
        return error.response.data.error;
    }
    if (error.code === 'ECONNABORTED') {
        return 'The request took too long. Please try again.';
    }
    if (!error.response) {
        return 'Cannot reach the server. Please check your connection and try again.';
    }
    return 'Something went wrong. Please try again.';
}

export const createCase = (premise, difficulty) =>
    api.post('/cases', { premise, difficulty }).then((res) => res.data);

export const getCase = (id) =>
    api.get(`/cases/${id}`).then((res) => res.data);

export const discoverClue = (id, clueId) =>
    api.post(`/cases/${id}/clues/${clueId}/discover`).then((res) => res.data);

export const requestHint = (id, hintNumber) =>
    api
        .post(`/cases/${id}/hints`, hintNumber ? { hintNumber } : {})
        .then((res) => res.data);

export const accuse = (id, suspectId) =>
    api.post(`/cases/${id}/accuse`, { suspectId }).then((res) => res.data);

export const getResult = (id) =>
    api.get(`/cases/${id}/result`).then((res) => res.data);