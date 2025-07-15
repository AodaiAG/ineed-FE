import axios from 'axios';
import { API_URLL } from './constans';

const api = axios.create({
    baseURL: API_URLL,
    withCredentials: true, // Ensures cross-origin cookies if needed
});

// Request interceptor to attach tokens from localStorage
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (accessToken) {
            config.headers['x-access-token'] = accessToken;
        }
        if (refreshToken) {
            config.headers['x-refresh-token'] = refreshToken;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to store tokens if they're returned in headers
api.interceptors.response.use(
    (response) => {

        if (response.headers['x-access-token']) {
            console.log('Response Interceptor: New Access Token received');
            localStorage.setItem('accessToken', response.headers['x-access-token']);
        }
        if (response.headers['x-refresh-token']) {
            console.log('Response Interceptor: New Refresh Token received');
            localStorage.setItem('refreshToken', response.headers['x-refresh-token']);
        }
        return response;
    },
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) 
            {
            console.warn('User unauthorized or refresh token expired:', error.response.status);
        } else {
            console.error('Response Interceptor Error:', error);
        }
        return Promise.reject(error);
    }
);

export default api;
