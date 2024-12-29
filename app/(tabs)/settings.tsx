import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { setColorScheme } from '@/constants/Colors';

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
    const [notifications, setNotifications] = useState(true);
    const [currency, setCurrency] = useState('USD');

    const handleThemeChange = (value: boolean) => {
        const newTheme = value ? 'dark' : 'light';
        setColorScheme(newTheme).catch(error => {
            console.error('Failed to change theme:', error);
        });
    };

    return (
        <ScrollView style={[styles.container, { 
            backgroundColor: Colors[colorScheme].background 
        }]}>
            <Text style={[styles.header, {
                color: Colors[colorScheme].text
            }]}>Settings</Text>

            <SettingSection title="Appearance">
                <SettingRow label="Dark Mode">
                    <Switch
                        value={colorScheme === 'dark'}
                        onValueChange={handleThemeChange}
                        trackColor={{ false: '#767577', true: '#4caf50' }}
                        thumbColor={notifications ? '#f4f3f4' : '#f4f3f4'}
                    />
                </SettingRow>
            </SettingSection>

            <SettingSection title="Preferences">
                <SettingRow label="Currency">
                    <TouchableOpacity onPress={() => {/* Handle currency selection */}}>
                        <Text style={[styles.buttonText, { color: Colors[colorScheme].text }]}>
                            {currency}
                        </Text>
                    </TouchableOpacity>
                </SettingRow>
                <SettingRow label="Notifications">
                    <Switch
                        value={notifications}
                        onValueChange={setNotifications}
                        trackColor={{ false: '#767577', true: '#4caf50' }}
                        thumbColor={notifications ? '#f4f3f4' : '#f4f3f4'}
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
    sectionContent: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    label: {
        fontSize: 16,
    },
    buttonText: {
        fontSize: 16,
    }
});