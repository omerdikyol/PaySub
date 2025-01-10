import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
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

export default function LoginScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError('');
      setIsLoading(true);
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.title}>PaySub</ThemedText>
            <ThemedText style={styles.subtitle}>Track your subscriptions with ease</ThemedText>
          </View>

          <View style={styles.formContainer}>
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
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <ThemedText style={styles.buttonText}>{t('login')}</ThemedText>
                </>
              )}
            </TouchableOpacity>

            <Link href="/register" asChild>
              <TouchableOpacity
                style={styles.registerLink}
                disabled={isLoading}
              >
                <ThemedText style={styles.registerText}>
                  {t('noAccount')} <ThemedText style={[styles.registerHighlight, { color: '#007AFF' }]}>{t('register')}</ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
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
  registerLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  registerText: {
    fontSize: 16,
  },
  registerHighlight: {
    fontWeight: '600',
  },
}); 