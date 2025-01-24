import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, Linking, Share, Modal, SafeAreaView } from 'react-native';
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
import { useNotifications } from '@/context/NotificationContext';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/constants/Translations';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

const SettingRow: React.FC<SettingRowProps & { onPress?: () => void; icon?: React.ReactNode }> = ({ 
    label, 
    children, 
    onPress,
    icon 
}) => {
    const colorScheme = useColorScheme();
    const content = (
        <>
            <View style={styles.row}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <Text style={[styles.label, { color: Colors[colorScheme].text }]}>{label}</Text>
                <View style={styles.settingControl}>
                    {children}
                </View>
            </View>
            <View style={[styles.divider, { backgroundColor: Colors[colorScheme].border }]} />
        </>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
};

export default function Settings() {
    const colorScheme = useColorScheme();
    const { colors } = useTheme();
    const { notificationsEnabled, setNotificationsEnabled } = useNotifications();
    const { language, setLanguage, t } = useLanguage();
    const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
    const [showLanguagePicker, setShowLanguagePicker] = useState(false);
    const { preferredCurrency, setPreferredCurrency } = useCurrency();
    const { currentUser, logout } = useAuth();

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

    const handleNotificationChange = async (value: boolean) => {
        try {
            if (value) {
                const hasPermission = await NotificationService.requestPermissions();
                if (!hasPermission) {
                    Alert.alert(
                        t('permissionRequired'),
                        t('enableNotificationsMessage'),
                        [
                            { text: t('cancel'), style: 'cancel' },
                            { text: t('openSettings'), onPress: () => Linking.openSettings() }
                        ]
                    );
                    return;
                }
            } else {
                await NotificationService.cancelAllNotifications();
            }

            await NotificationService.setNotificationsEnabled(value);
            await setNotificationsEnabled(value);
        } catch (error) {
            console.error('Error updating notification settings:', error);
            Alert.alert(t('error'), t('notificationUpdateError'));
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
                Alert.alert(t('permissionRequired'), t('enableNotificationsMessage'));
                return;
            }

            const testExpense = {
                id: 'test-expense-' + Date.now(),
                name: t('testExpense'),
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
            Alert.alert(t('success'), t('testNotificationSent'));
        } catch (error) {
            console.error('Failed to send test notification:', error);
            Alert.alert(t('error'), t('testNotificationError'));
        }
    };

    const handleTestScheduledNotification = async () => {
        try {
            const hasPermission = await NotificationService.requestPermissions();
            if (!hasPermission) {
                Alert.alert(t('permissionRequired'), t('enableNotificationsMessage'));
                return;
            }

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(14, 0, 0, 0);

            const testExpense = {
                id: 'test-scheduled-expense-' + Date.now(),
                name: t('tomorrowTestExpense'),
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
            Alert.alert(t('success'), t('scheduledNotificationSent'));

            await NotificationService.scheduleExpenseNotification(testExpense);
        } catch (error) {
            console.error('Failed to schedule test notification:', error);
            Alert.alert(t('error'), t('scheduledNotificationError'));
        }
    };

    const handleViewScheduledNotifications = async () => {
        try {
            const scheduledNotifications = await NotificationService.getAllScheduledNotifications();
            Alert.alert(
                t('scheduledNotifications'),
                t('scheduledNotificationsCount').replace('{count}', scheduledNotifications.length.toString()) + '\n\n' +
                scheduledNotifications.map((notification, index) => {
                    const trigger = notification.trigger as any;
                    const date = new Date(trigger.value);
                    return `${index + 1}. "${notification.content.title}" ${t('scheduledFor')} ${date.toLocaleString()}`;
                }).join('\n\n')
            );
        } catch (error) {
            console.error('Failed to get scheduled notifications:', error);
            Alert.alert(t('error'), t('getScheduledNotificationsError'));
        }
    };

    const handleShareApp = async () => {
        try {
            await Share.share({
                message: t('shareMessage'),
                url: 'https://paysub.app',
            });
        } catch (error) {
            console.error('Error sharing app:', error);
        }
    };

    const handleExportData = async () => {
        Alert.alert(t('comingSoon'), t('dataExportMessage'));
    };

    const handleImportData = async () => {
        Alert.alert(t('comingSoon'), t('dataImportMessage'));
    };

    const handleLanguageChange = async (newLanguage: Language) => {
        await setLanguage(newLanguage);
        setShowLanguagePicker(false);
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    const renderUserSection = () => {
        if (currentUser) {
            return (
                <ThemedView style={[styles.section, { backgroundColor: colors.card.background }]}>
                    <View style={styles.userHeader}>
                        <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
                            <FontAwesome name="user" size={32} color={colors.primary} />
                        </View>
                        <View style={styles.userInfo}>
                            <ThemedText style={styles.userName}>{currentUser.displayName || currentUser.email?.split('@')[0]}</ThemedText>
                            <ThemedText style={styles.userEmail}>{currentUser.email}</ThemedText>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.logoutButton, { backgroundColor: colors.error + '10' }]}
                        onPress={handleLogout}
                    >
                        <FontAwesome name="sign-out" size={20} color={colors.error} />
                        <ThemedText style={[styles.logoutButtonText, { color: colors.error }]}>{t('logout')}</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            );
        }

        return (
            <ThemedView style={[styles.authSection, { backgroundColor: colors.card.background }]}>
                <ThemedText style={styles.authTitle}>{t('welcomeBack')}</ThemedText>
                <ThemedText style={styles.authDescription}>{t('signInToContinue')}</ThemedText>
                <View style={styles.authButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.authButton, { backgroundColor: '#007AFF' }]}
                        onPress={() => router.push('/login')}
                    >
                        <Ionicons name="log-in-outline" size={24} color="#FFFFFF" style={styles.authButtonIcon} />
                        <ThemedText style={styles.authButtonText}>{t('login')}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.authButton, { backgroundColor: colors.card.subtle }]}
                        onPress={() => router.push('/register')}
                    >
                        <Ionicons name="person-add-outline" size={24} color={colors.text} style={styles.authButtonIcon} />
                        <ThemedText style={[styles.authButtonText, { color: colors.text }]}>{t('register')}</ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        );
    };

    return (
        <ScreenLayout>
            <ScrollView style={styles.container}>
                {renderUserSection()}

                <ThemedText style={styles.header}>{t('settings')}</ThemedText>

                <SettingSection title={t('appearance')}>
                    <SettingRow 
                        label={t('darkMode')}
                        icon={<FontAwesome name="moon-o" size={20} color="#6C63FF" />}
                    >
                        <Switch
                            value={colorScheme === 'dark'}
                            onValueChange={handleThemeChange}
                            trackColor={{ 
                                false: colors.background === '#000000' ? '#3A3A3C' : '#E5E5EA',
                                true: '#2563EB'
                            }}
                            thumbColor={
                                colorScheme === 'dark' ? '#60A5FA' : '#93C5FD'
                            }
                            ios_backgroundColor={colors.background === '#000000' ? '#3A3A3C' : '#E5E5EA'}
                            style={{ transform: [{ scaleX: 0.95 }, { scaleY: 0.9 }] }}
                        />
                    </SettingRow>
                    <SettingRow 
                        label={t('language')}
                        icon={<FontAwesome name="language" size={20} color="#4CAF50" />}
                        onPress={() => setShowLanguagePicker(true)}
                    >
                        <View style={styles.settingValue}>
                            <ThemedText style={styles.settingText}>
                                {language === 'en' ? 'English' : 'Türkçe'}
                            </ThemedText>
                            <FontAwesome name="chevron-right" size={12} color={colors.text} />
                        </View>
                    </SettingRow>
                </SettingSection>

                <SettingSection title={t('preferences')}>
                    <SettingRow 
                        label={t('currency')}
                        icon={<FontAwesome name="money" size={20} color="#FFC107" />}
                        onPress={() => setShowCurrencyPicker(true)}
                    >
                        <View style={styles.settingValue}>
                            <View style={styles.currencyInfo}>
                                <ThemedText style={styles.settingText}>
                                    {currencies[preferredCurrency].flag} {preferredCurrency}
                                </ThemedText>
                                <ThemedText style={styles.currencySymbol}>
                                    {currencies[preferredCurrency].symbol}
                                </ThemedText>
                            </View>
                            <FontAwesome name="chevron-right" size={12} color={colors.text} />
                        </View>
                    </SettingRow>
                    <SettingRow 
                        label={t('notifications')}
                        icon={<FontAwesome name="bell" size={20} color="#FF5722" />}
                    >
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={handleNotificationChange}
                            trackColor={{ 
                                false: colors.background === '#000000' ? '#3A3A3C' : '#E5E5EA',
                                true: '#2563EB'
                            }}
                            thumbColor={
                                notificationsEnabled ? '#60A5FA' : '#93C5FD'
                            }
                            ios_backgroundColor={colors.background === '#000000' ? '#3A3A3C' : '#E5E5EA'}
                            style={{ transform: [{ scaleX: 0.95 }, { scaleY: 0.9 }] }}
                        />
                    </SettingRow>
                </SettingSection>

                <SettingSection title={t('dataManagement')}>
                    <ThemedText style={[styles.testDescription, { marginHorizontal: 16, marginTop: 8 }]}>
                        {t('dataExportMessage')}
                    </ThemedText>
                    <SettingRow 
                        label={t('exportData')}
                        icon={<FontAwesome name="download" size={20} color="#2196F3" style={{ opacity: 0.5 }} />}
                    >
                        <FontAwesome name="chevron-right" size={12} color={colors.text} style={{ opacity: 0.5 }} />
                    </SettingRow>
                    <SettingRow 
                        label={t('importData')}
                        icon={<FontAwesome name="upload" size={20} color="#9C27B0" style={{ opacity: 0.5 }} />}
                    >
                        <FontAwesome name="chevron-right" size={12} color={colors.text} style={{ opacity: 0.5 }} />
                    </SettingRow>
                </SettingSection>

                <SettingSection title={t('about')}>
                    <SettingRow 
                        label={t('shareApp')}
                        icon={<FontAwesome name="share-alt" size={20} color="#00BCD4" />}
                        onPress={handleShareApp}
                    >
                        <FontAwesome name="chevron-right" size={12} color={colors.text} />
                    </SettingRow>
                    <SettingRow 
                        label={t('userAgreement')}
                        icon={<FontAwesome name="file-text-o" size={20} color="#3F51B5" />}
                        onPress={() => Linking.openURL('https://paysub.app/terms')}
                    >
                        <FontAwesome name="chevron-right" size={12} color={colors.text} />
                    </SettingRow>
                    <SettingRow 
                        label={t('followTwitter')}
                        icon={<FontAwesome name="twitter" size={20} color="#1DA1F2" />}
                        onPress={() => Linking.openURL('https://twitter.com/paysubapp')}
                    >
                        <FontAwesome name="chevron-right" size={12} color={colors.text} />
                    </SettingRow>
                </SettingSection>

                <SettingSection title={t('notificationTesting')}>
                    <ThemedView style={styles.testSection}>
                        <ThemedText style={styles.testDescription}>
                            {t('testDescription')}
                        </ThemedText>
                        
                        <ThemedButton
                            style={[styles.testButton, { marginBottom: 12 }]}
                            textStyle={styles.buttonText}
                            onPress={handleTestNotification}
                        >
                            {t('sendTestNotification')}
                        </ThemedButton>

                        <ThemedButton
                            style={[styles.testButton, { marginBottom: 12 }]}
                            textStyle={styles.buttonText}
                            onPress={handleTestScheduledNotification}
                        >
                            {t('testTomorrowNotification')}
                        </ThemedButton>

                        <ThemedButton
                            style={[styles.testButton, { backgroundColor: colors.card.subtle }]}
                            textStyle={styles.buttonText}
                            onPress={handleViewScheduledNotifications}
                        >
                            {t('viewScheduledNotifications')}
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

            <Modal
                visible={showLanguagePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowLanguagePicker(false)}
            >
                <SafeAreaView style={styles.sheetBackdrop}>
                    <View style={[styles.sheetContainer, { backgroundColor: colors.card.background }]}>
                        <ThemedText style={styles.sheetTitle}>{t('language')}</ThemedText>
                        <TouchableOpacity
                            style={styles.sheetItem}
                            onPress={() => handleLanguageChange('en')}
                        >
                            <ThemedText style={[
                                styles.languageItemText,
                                language === 'en' && { color: colors.primary }
                            ]}>
                                English
                                {language === 'en' && ' ✓'}
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.sheetItem}
                            onPress={() => handleLanguageChange('tr')}
                        >
                            <ThemedText style={[
                                styles.languageItemText,
                                language === 'tr' && { color: colors.primary }
                            ]}>
                                Türkçe
                                {language === 'tr' && ' ✓'}
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.sheetCancel} 
                            onPress={() => setShowLanguagePicker(false)}
                        >
                            <ThemedText style={{ color: '#FF3B30' }}>{t('cancel')}</ThemedText>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
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
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: 'transparent',
    },
    iconContainer: {
        width: 32,
        marginRight: 12,
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        flex: 1,
    },
    settingControl: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    settingText: {
        fontSize: 16,
    },
    currencyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
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
    buttonText: {
        fontSize: 16,
    },
    divider: {
        height: 1,
        marginLeft: 60,
        marginRight: 16,
    },
    languageItemText: {
        fontSize: 18,
    },
    sheetBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    sheetItem: {
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    sheetCancel: {
        alignSelf: 'center',
        marginTop: 12,
        paddingVertical: 8,
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        opacity: 0.7,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    authSection: {
        marginBottom: 24,
        borderRadius: 12,
        padding: 20,
    },
    authTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    authDescription: {
        fontSize: 16,
        opacity: 0.7,
        marginBottom: 20,
    },
    authButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    authButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
    },
    authButtonIcon: {
        marginRight: 8,
    },
    authButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});