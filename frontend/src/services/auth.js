import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || '/api') + '/auth';

export const authService = {
    async login(email, password) {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        if (response.data.access_token) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    async register(username, email, password) {
        const response = await axios.post(`${API_URL}/register`, {
            username,
            email,
            password,
        });
        return response.data;
    },

    logout() {
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    }
};
