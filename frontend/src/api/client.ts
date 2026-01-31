import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3002/api';

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('studyos_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle auth errors
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('🔒 Auth Error (401) in api/client:', error.config.url);
            console.warn('⚠️ Auto-redirect disabled for debugging.');
            // localStorage.removeItem('studyos_token');
            // localStorage.removeItem('studyos_user');
            // Optional: Redirect to login or dispatch an event
            // if (window.location.pathname !== '/auth/login' && window.location.pathname !== '/auth/register') {
            //     window.location.href = '/auth/login';
            // }
        }
        return Promise.reject(error);
    }
);

export default client;
