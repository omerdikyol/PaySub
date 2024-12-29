import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';

export default function Settings() {
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [currency, setCurrency] = useState('USD');

    const SettingSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );

    const SettingRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
        <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{label}</Text>
            {children}
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Settings</Text>

            <SettingSection title="Appearance">
                <SettingRow label="Dark Mode">
                    <Switch
                        value={darkMode}
                        onValueChange={setDarkMode}
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                    />
                </SettingRow>
            </SettingSection>

            <SettingSection title="Preferences">
                <SettingRow label="Currency">
                    <TouchableOpacity onPress={() => {/* Handle currency selection */}}>
                        <Text style={styles.buttonText}>{currency}</Text>
                    </TouchableOpacity>
                </SettingRow>
                <SettingRow label="Notifications">
                    <Switch
                        value={notifications}
                        onValueChange={setNotifications}
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                    />
                </SettingRow>
            </SettingSection>

            <SettingSection title="About">
                <SettingRow label="Version">
                    <Text style={styles.versionText}>1.0.0</Text>
                </SettingRow>
            </SettingSection>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#ffffff',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#ffffff',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    settingLabel: {
        fontSize: 16,
        color: '#bbbbbb',
    },
    buttonText: {
        color: '#007AFF',
        fontSize: 16,
    },
    versionText: {
        color: '#666666',
        fontSize: 16,
    },
});