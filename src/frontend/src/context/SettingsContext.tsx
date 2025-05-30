import React, { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';

type Settings = Record<string, any>;

const SettingsContext = createContext<{ settings: Settings | null }>({ settings: null });

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings | null>(null);

    useEffect(() => {
        axiosInstance.get('/settings').then(res => setSettings(res.data));
    }, []);

    return (
        <SettingsContext.Provider value={{ settings }}>
            {children}
        </SettingsContext.Provider>
    );
};
