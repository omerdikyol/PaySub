import { StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import { ThemedView, ThemedText, ThemedSection } from '@/components/Themed';
import { useTheme } from '@/components/useTheme';
import { setColorScheme } from '@/constants/Colors';

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
            <ThemedSection>
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

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
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
        </ScrollView>
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
        marginBottom: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    label: {
        fontSize: 16,
    },
    buttonText: {
        fontSize: 16,
    }
});