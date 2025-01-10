import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/components/useTheme';
import { ThemedText, ThemedView } from '@/components/Themed';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setError('');

      if (password !== confirmPassword) {
        setError(t('passwordsDoNotMatch'));
        return;
      }

      setIsLoading(true);
      await register({
        name,
        email,
        password,
        defaultCurrency: 'TRY',
        language: 'en',
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            <View style={styles.headerContainer}>
              <ThemedText style={styles.title}>{t('createAccount')}</ThemedText>
              <ThemedText style={styles.subtitle}>Join PaySub to manage your subscriptions</ThemedText>
            </View>

            <View style={styles.formContainer}>
              <View style={[styles.inputContainer, { 
                backgroundColor: colors.colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7',
                borderWidth: 1,
                borderColor: colors.colorScheme === 'dark' ? '#2C2C2E' : '#E5E5EA'
              }]}>
                <Ionicons name="person-outline" size={20} color={colors.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('name')}
                  placeholderTextColor={colors.text}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>

              <View style={[styles.inputContainer, { 
                backgroundColor: colors.colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7',
                borderWidth: 1,
                borderColor: colors.colorScheme === 'dark' ? '#2C2C2E' : '#E5E5EA'
              }]}>
                <Ionicons name="mail-outline" size={20} color={colors.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('email')}
                  placeholderTextColor={colors.text}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                />
              </View>

              <View style={[styles.inputContainer, { 
                backgroundColor: colors.colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7',
                borderWidth: 1,
                borderColor: colors.colorScheme === 'dark' ? '#2C2C2E' : '#E5E5EA'
              }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('password')}
                  placeholderTextColor={colors.text}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              <View style={[styles.inputContainer, { 
                backgroundColor: colors.colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7',
                borderWidth: 1,
                borderColor: colors.colorScheme === 'dark' ? '#2C2C2E' : '#E5E5EA'
              }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder={t('confirmPassword')}
                  placeholderTextColor={colors.text}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color="#FF3B30" />
                  <ThemedText style={styles.error}>{error}</ThemedText>
                </View>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: '#007AFF' },
                  isLoading && { opacity: 0.7 }
                ]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    <ThemedText style={styles.buttonText}>{t('register')}</ThemedText>
                  </>
                )}
              </TouchableOpacity>

              <Link href="/login" asChild>
                <TouchableOpacity
                  style={styles.loginLink}
                  disabled={isLoading}
                >
                  <ThemedText style={styles.loginText}>
                    {t('haveAccount')} <ThemedText style={[styles.loginHighlight, { color: '#007AFF' }]}>{t('login')}</ThemedText>
                  </ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
  },
  button: {
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loginText: {
    fontSize: 16,
  },
  loginHighlight: {
    fontWeight: '600',
  },
}); 