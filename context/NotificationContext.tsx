import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from '@/services/NotificationService';

interface NotificationContextType {
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => Promise<void>;
    scheduleDailyNotifications: (expenses: any[]) => Promise<void>;
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

    const scheduleDailyNotifications = async (expenses: any[]) => {
        if (!notificationsEnabled || !expenses.length) return;

        try {
            // Request notification permissions
            const hasPermission = await NotificationService.requestPermissions();
            if (!hasPermission) {
                console.log('Notification permissions not granted');
                return;
            }

            // Cancel any existing daily notifications before scheduling new ones
            const scheduledNotifications = await NotificationService.getAllScheduledNotifications();
            const dailyNotifications = scheduledNotifications.filter(
                notification => notification.content.data?.type === 'daily-summary'
            );
            
            for (const notification of dailyNotifications) {
                await NotificationService.cancelNotification(notification.identifier);
            }

            // Schedule new daily notifications
            await NotificationService.scheduleDailyExpenseNotifications(expenses);
        } catch (error) {
            console.error('Error scheduling daily notifications:', error);
        }
    };

    const setNotificationsEnabled = async (enabled: boolean) => {
        try {
            await AsyncStorage.setItem('notificationsEnabled', enabled.toString());
            setNotificationsEnabledState(enabled);

            if (!enabled) {
                // Cancel all notifications when disabled
                await NotificationService.cancelAllNotifications();
            }
        } catch (error) {
            console.error('Error saving notification settings:', error);
        }
    };

    return (
        <NotificationContext.Provider value={{ 
            notificationsEnabled, 
            setNotificationsEnabled,
            scheduleDailyNotifications 
        }}>
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