import { StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import { ThemedView, ThemedText, ThemedSection, ThemedButton } from '@/components/Themed';
import { useTheme } from '@/components/useTheme';
import { setColorScheme } from '@/constants/Colors';
import { ScreenLayout } from '@/components/ScreenLayout';
import { NotificationService } from '@/services/NotificationService';
import { RecurrenceType } from '@/app/types/expense';

interface SettingSectionProps {
    title: string;
    children: React.ReactNode;
}

interface SettingRowProps {
    label: string;
    children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => {
    return (
        <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
            <ThemedSection style={styles.sectionContent}>
                {children}
            </ThemedSection>
        </ThemedView>
    );
};

const SettingRow: React.FC<SettingRowProps> = ({ label, children }) => {
    return (
        <ThemedView style={styles.row}>
            <ThemedText style={styles.label}>{label}</ThemedText>
            {children}
        </ThemedView>
    );
};

export default function Settings() {
    const colorScheme = useColorScheme();
    const { colors } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [currency, setCurrency] = useState('USD');

    const handleThemeChange = (value: boolean) => {
        const newTheme = value ? 'dark' : 'light';
        setColorScheme(newTheme).catch(error => {
            console.error('Failed to change theme:', error);
        });
    };

    const handleTestNotification = async () => {
        try {
            // Request permissions first
            const hasPermission = await NotificationService.requestPermissions();
            if (!hasPermission) {
                Alert.alert('Permission Required', 'Please enable notifications in your device settings to test notifications.');
                return;
            }

            // Create a test expense
            const testExpense = {
                id: 'test-expense-' + Date.now(),
                name: 'Test Expense',
                amount: 99.99,
                currency: 'USD',
                startDate: new Date().toISOString(),
                color: '#FF6B6B',
                notification: {
                    enabled: true,
                    daysInAdvance: 1,
                    time: {
                        hour: 12,
                        minute: 30
                    }
                },
                recurrence: {
                    type: 'once' as RecurrenceType,
                },
                paymentHistory: {} as Record<string, { isPaid: boolean; paidDate?: string }>
            };

            // Send test notification
            await NotificationService.testNotification(testExpense);
            Alert.alert('Success', 'Test notification sent! You should receive it shortly.');
        } catch (error) {
            console.error('Failed to send test notification:', error);
            Alert.alert('Error', 'Failed to send test notification. Please try again.');
        }
    };

    const handleTestScheduledNotification = async () => {
        try {
            // Request permissions first
            const hasPermission = await NotificationService.requestPermissions();
            if (!hasPermission) {
                Alert.alert('Permission Required', 'Please enable notifications in your device settings to test notifications.');
                return;
            }

            // Create tomorrow's date
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(14, 0, 0, 0); // Set to 2 PM tomorrow

            // Create a test expense
            const testExpense = {
                id: 'test-scheduled-expense-' + Date.now(),
                name: 'Tomorrow\'s Test Expense',
                amount: 149.99,
                currency: 'USD',
                startDate: tomorrow.toISOString(),
                color: '#4ECDC4',
                notification: {
                    enabled: true,
                    daysInAdvance: 1,
                    time: {
                        hour: 12,
                        minute: 30
                    }
                },
                recurrence: {
                    type: 'once' as RecurrenceType,
                },
                paymentHistory: {} as Record<string, { isPaid: boolean; paidDate?: string }>
            };

            // Schedule notification for 1 minute from now
            await NotificationService.testScheduledNotification(testExpense, 1);
            Alert.alert(
                'Success', 
                'Scheduled a test notification for 1 minute from now. This simulates getting a notification for tomorrow\'s expense.'
            );

            // Also schedule the actual expense notification
            await NotificationService.scheduleExpenseNotification(testExpense);
            Alert.alert(
                'Success',
                'Also scheduled the actual expense notification for tomorrow at the specified time.'
            );
        } catch (error) {
            console.error('Failed to schedule test notification:', error);
            Alert.alert('Error', 'Failed to schedule test notification. Please try again.');
        }
    };

    const handleViewScheduledNotifications = async () => {
        try {
            const scheduledNotifications = await NotificationService.getAllScheduledNotifications();
            Alert.alert(
                'Scheduled Notifications',
                `You have ${scheduledNotifications.length} scheduled notification(s).\n\n` +
                scheduledNotifications.map((notification, index) => {
                    const trigger = notification.trigger as any;
                    const date = new Date(trigger.value);
                    return `${index + 1}. "${notification.content.title}" scheduled for ${date.toLocaleString()}`;
                }).join('\n\n')
            );
        } catch (error) {
            console.error('Failed to get scheduled notifications:', error);
            Alert.alert('Error', 'Failed to get scheduled notifications. Please try again.');
        }
    };

    return (
        <ScreenLayout>
            <ScrollView style={styles.container}>
                <ThemedText style={styles.header}>Settings</ThemedText>

                <SettingSection title="Appearance">
                    <SettingRow label="Dark Mode">
                        <Switch
                            value={colorScheme === 'dark'}
                            onValueChange={handleThemeChange}
                            trackColor={{ false: '#767577', true: colors.secondary }}
                            thumbColor="#f4f3f4"
                        />
                    </SettingRow>
                </SettingSection>

                <SettingSection title="Preferences">
                    <SettingRow label="Currency">
                        <TouchableOpacity onPress={() => {/* Handle currency selection */}}>
                            <ThemedText style={styles.buttonText}>
                                {currency}
                            </ThemedText>
                        </TouchableOpacity>
                    </SettingRow>
                    <SettingRow label="Notifications">
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: '#767577', true: colors.secondary }}
                            thumbColor="#f4f3f4"
                        />
                    </SettingRow>
                </SettingSection>

                <SettingSection title="Notification Testing">
                    <ThemedView style={styles.testSection}>
                        <ThemedText style={styles.testDescription}>
                            Test the notification system with different scenarios.
                        </ThemedText>
                        
                        <ThemedButton
                            style={[styles.testButton, { marginBottom: 12 }]}
                            textStyle={styles.testButtonText}
                            onPress={handleTestNotification}
                        >
                            Send Immediate Test Notification
                        </ThemedButton>

                        <ThemedButton
                            style={[styles.testButton, { marginBottom: 12 }]}
                            textStyle={styles.testButtonText}
                            onPress={handleTestScheduledNotification}
                        >
                            Test Tomorrow's Expense Notification
                        </ThemedButton>

                        <ThemedButton
                            style={[styles.testButton, { backgroundColor: colors.card.subtle }]}
                            textStyle={[styles.testButtonText, { color: colors.text }]}
                            onPress={handleViewScheduledNotifications}
                        >
                            View Scheduled Notifications
                        </ThemedButton>
                    </ThemedView>
                </SettingSection>
            </ScrollView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionContent: {
        width: '100%',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    label: {
        fontSize: 16,
    },
    buttonText: {
        fontSize: 16,
    },
    testSection: {
        padding: 16,
    },
    testDescription: {
        fontSize: 14,
        marginBottom: 16,
        opacity: 0.7,
    },
    testButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    testButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});