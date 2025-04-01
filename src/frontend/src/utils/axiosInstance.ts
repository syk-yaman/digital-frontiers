import axios from 'axios';
import { API_BASE_URL } from '@/config';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

// Add a request interceptor to include the JWT token
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
