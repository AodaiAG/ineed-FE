import axios from 'axios';
import { API_URLL } from './constans';


const clientApi = axios.create({
    baseURL: API_URLL,
    withCredentials: true,
});

// Request interceptor to attach tokens
clientApi.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('clientAccessToken');
        const refreshToken = localStorage.getItem('clientRefreshToken');

        if (accessToken) {
            
            config.headers['x-access-token'] = accessToken;
        }
        if (refreshToken) {
            config.headers['x-refresh-token'] = refreshToken;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to store updated tokens
clientApi.interceptors.response.use(
    (response) => {
        if (response.headers['x-access-token']) {
            localStorage.setItem('clientAccessToken', response.headers['x-access-token']);
        }
        if (response.headers['x-refresh-token']) {
            localStorage.setItem('clientRefreshToken', response.headers['x-refresh-token']);
        }
        return response;
    },
    (error) => Promise.reject(error)
);

export default clientApi;
