import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import { ThemedView, ThemedText, ThemedSection, ThemedButton } from '@/components/Themed';
import { useTheme } from '@/components/useTheme';
import Colors, { setColorScheme } from '@/constants/Colors';
import { ScreenLayout } from '@/components/ScreenLayout';
import { NotificationService } from '@/services/NotificationService';
import { RecurrenceType } from '@/app/types/expense';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CurrencyPickerModal } from '@/components/Modals/CurrencyPickerModal';
import { currencies } from '@/utils/currency';
import { useCurrency } from '@/context/CurrencyContext';

interface SettingSectionProps {
    title: string;
    children: React.ReactNode;
}

interface SettingRowProps {
    label: string;
    children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => {
    const colorScheme = useColorScheme();
    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { 
                color: Colors[colorScheme].text
            }]}>{title}</Text>
            <View style={[styles.sectionContent, { 
                backgroundColor: Colors[colorScheme].background,
                borderColor: Colors[colorScheme].border
            }]}>
                {children}
            </View>
        </View>
    );
};

const SettingRow: React.FC<SettingRowProps> = ({ label, children }) => {
    const colorScheme = useColorScheme();
    return (
        <View style={styles.row}>
            <Text style={[styles.label, { color: Colors[colorScheme].text }]}>{label}</Text>
            {children}
        </View>
    );
};

export default function Settings() {
    const colorScheme = useColorScheme();
    const { colors } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
    const { preferredCurrency, setPreferredCurrency } = useCurrency();

    useEffect(() => {
        loadPreferredCurrency();
    }, []);

    const loadPreferredCurrency = async () => {
        try {
            const saved = await AsyncStorage.getItem('preferredCurrency');
            if (saved) {
                setPreferredCurrency(saved);
            }
        } catch (error) {
            console.error('Error loading preferred currency:', error);
        }
    };

    const handleCurrencyChange = async (currency: string) => {
        await setPreferredCurrency(currency);
        setShowCurrencyPicker(false);
    };

    const handleThemeChange = (value: boolean) => {
        const newTheme = value ? 'dark' : 'light';
        setColorScheme(newTheme).catch(error => {
            console.error('Failed to change theme:', error);
        });
    };

    const handleTestNotification = async () => {
        try {
            const hasPermission = await NotificationService.requestPermissions();
            if (!hasPermission) {
                Alert.alert('Permission Required', 'Please enable notifications in your device settings to test notifications.');
                return;
            }

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
                paymentHistory: {}
            };

            await NotificationService.testNotification(testExpense);
            Alert.alert('Success', 'Test notification sent! You should receive it shortly.');
        } catch (error) {
            console.error('Failed to send test notification:', error);
            Alert.alert('Error', 'Failed to send test notification. Please try again.');
        }
    };

    const handleTestScheduledNotification = async () => {
        try {
            const hasPermission = await NotificationService.requestPermissions();
            if (!hasPermission) {
                Alert.alert('Permission Required', 'Please enable notifications in your device settings to test notifications.');
                return;
            }

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(14, 0, 0, 0);

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
                paymentHistory: {}
            };

            await NotificationService.testScheduledNotification(testExpense, 1);
            Alert.alert(
                'Success', 
                'Scheduled a test notification for 1 minute from now. This simulates getting a notification for tomorrow\'s expense.'
            );

            await NotificationService.scheduleExpenseNotification(testExpense);
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
                            trackColor={{ false: '#767577', true: colors.primary }}
                            thumbColor="#ffffff"
                            ios_backgroundColor="#767577"
                        />
                    </SettingRow>
                </SettingSection>

                <SettingSection title="Preferences">
                    <SettingRow label="Currency">
                        <TouchableOpacity 
                            style={styles.currencyDisplay}
                            onPress={() => setShowCurrencyPicker(true)}
                        >
                            <View style={styles.currencyInfo}>
                                <ThemedText style={styles.currencyText}>
                                    {currencies[preferredCurrency].flag} {preferredCurrency}
                                </ThemedText>
                                <ThemedText style={styles.currencySymbol}>
                                    {currencies[preferredCurrency].symbol}
                                </ThemedText>
                            </View>
                            <FontAwesome name="chevron-right" size={12} color={colors.text} />
                        </TouchableOpacity>
                    </SettingRow>
                    <SettingRow label="Notifications">
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: '#767577', true: colors.primary }}
                            thumbColor="#ffffff"
                            ios_backgroundColor="#767577"
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
                            onPress={handleTestNotification}
                        >
                            Send Immediate Test Notification
                        </ThemedButton>

                        <ThemedButton
                            style={[styles.testButton, { marginBottom: 12 }]}
                            onPress={handleTestScheduledNotification}
                        >
                            Test Tomorrow's Expense Notification
                        </ThemedButton>

                        <ThemedButton
                            style={[styles.testButton, { backgroundColor: colors.card.subtle }]}
                            onPress={handleViewScheduledNotifications}
                        >
                            View Scheduled Notifications
                        </ThemedButton>
                    </ThemedView>
                </SettingSection>
            </ScrollView>

            <CurrencyPickerModal
                visible={showCurrencyPicker}
                onClose={() => setShowCurrencyPicker(false)}
                onSelect={handleCurrencyChange}
                selectedCurrency={preferredCurrency}
            />
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
    currencyDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    currencyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    currencyText: {
        fontSize: 16,
    },
    currencySymbol: {
        fontSize: 16,
        opacity: 0.7,
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
});