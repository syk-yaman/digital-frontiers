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

// Add a response interceptor to handle 401 Unauthorized
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear the token from localStorage
            localStorage.removeItem('authToken');

            // Redirect to the sign-in page
            window.location.href = '/signin';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
