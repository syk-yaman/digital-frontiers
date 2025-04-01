import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
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
