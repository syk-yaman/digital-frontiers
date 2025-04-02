import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '@/utils/axiosInstance';

interface User {
    isAdmin: boolean;
    email: string;
    userId: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
            fetchCurrentUser(); // Fetch user details if token exists
        }
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await axiosInstance.get(`/users/me`);
            setUser(response.data); // Store user details in state
        } catch (error) {
            console.error('Failed to fetch current user:', error);
            logout(); // Log out if fetching user details fails
        }
    };

    const login = (token: string) => {
        localStorage.setItem('authToken', token);
        setIsAuthenticated(true);
        fetchCurrentUser(); // Fetch user details after login
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
