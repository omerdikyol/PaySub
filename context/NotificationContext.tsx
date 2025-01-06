import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationContextType {
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notificationsEnabled, setNotificationsEnabledState] = useState(false);

    useEffect(() => {
        loadNotificationSettings();
    }, []);

    const loadNotificationSettings = async () => {
        try {
            const enabled = await AsyncStorage.getItem('notificationsEnabled');
            setNotificationsEnabledState(enabled === 'true');
        } catch (error) {
            console.error('Error loading notification settings:', error);
        }
    };

    const setNotificationsEnabled = async (enabled: boolean) => {
        try {
            await AsyncStorage.setItem('notificationsEnabled', enabled.toString());
            setNotificationsEnabledState(enabled);
        } catch (error) {
            console.error('Error saving notification settings:', error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notificationsEnabled, setNotificationsEnabled }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
} 