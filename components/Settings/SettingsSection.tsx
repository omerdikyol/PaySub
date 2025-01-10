import React from 'react';
import { StyleSheet, View, Switch, TouchableOpacity, Alert, Linking } from 'react-native';
import { useTheme } from '@/components/useTheme';
import { ThemedText } from '@/components/Themed';
import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';

export default function SettingsSection() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const colorScheme = useColorScheme();

  const handleThemeChange = (value: boolean) => {
    // TODO: Implement theme change
  };

  return (
    <View style={styles.container}>
      <View style={[styles.section, { backgroundColor: colors.card.background }]}>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="moon-outline" size={24} color={colors.text} />
          <ThemedText style={styles.label}>{t('darkMode')}</ThemedText>
          <Switch
            value={colorScheme === 'dark'}
            onValueChange={handleThemeChange}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor="#ffffff"
            ios_backgroundColor="#767577"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          <ThemedText style={styles.label}>{t('notifications')}</ThemedText>
          <Switch
            value={false}
            onValueChange={() => {}}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor="#ffffff"
            ios_backgroundColor="#767577"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Ionicons name="language-outline" size={24} color={colors.text} />
          <ThemedText style={styles.label}>{t('language')}</ThemedText>
          <ThemedText style={styles.value}>English</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Ionicons name="cash-outline" size={24} color={colors.text} />
          <ThemedText style={styles.label}>{t('currency')}</ThemedText>
          <ThemedText style={styles.value}>USD</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card.background }]}>
        <TouchableOpacity style={styles.row}>
          <Ionicons name="document-text-outline" size={24} color={colors.text} />
          <ThemedText style={styles.label}>{t('userAgreement')}</ThemedText>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Ionicons name="share-social-outline" size={24} color={colors.text} />
          <ThemedText style={styles.label}>{t('shareApp')}</ThemedText>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  label: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  value: {
    marginLeft: 8,
    opacity: 0.7,
  },
}); 