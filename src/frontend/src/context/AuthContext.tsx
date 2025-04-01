import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if a token exists in localStorage
        const token = localStorage.getItem('authToken');
        setIsAuthenticated(!!token);
    }, []);

    const login = (token: string) => {
        localStorage.setItem('authToken', token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
