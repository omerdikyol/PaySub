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
  Image,
} from 'react-native';
import { useTheme } from '@/components/useTheme';
import { ThemedText, ThemedView } from '@/components/Themed';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAuthErrorMessage } from '../utils/authErrors';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (isLoading) return;

    try {
      setError('');

      // Basic validation
      if (!name.trim()) {
        setError('Please enter your name');
        return;
      }
      if (!email.trim()) {
        setError('Please enter your email');
        return;
      }
      if (!password.trim()) {
        setError('Please enter a password');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setIsLoading(true);
      await signup(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
      setIsLoading(false);
    }
  };

  const handleLoginPress = () => {
    if (isLoading) return;
    router.push('/login');
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
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/images/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <ThemedText style={styles.title}>PaySub</ThemedText>
              <ThemedText style={styles.subtitle}>Join PaySub to manage your subscriptions</ThemedText>
            </View>

            <View style={styles.formContainer}>
              <View style={[styles.inputContainer, { 
                backgroundColor: colors.card.background,
                borderWidth: 1,
                borderColor: error && name === '' ? colors.error : colors.border
              }]}>
                <Ionicons name="person-outline" size={20} color={colors.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Name"
                  placeholderTextColor={colors.text}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!isLoading}
                  returnKeyType="next"
                />
              </View>

              <View style={[styles.inputContainer, { 
                backgroundColor: colors.card.background,
                borderWidth: 1,
                borderColor: error && email === '' ? colors.error : colors.border
              }]}>
                <Ionicons name="mail-outline" size={20} color={colors.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Email"
                  placeholderTextColor={colors.text}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                  returnKeyType="next"
                />
              </View>

              <View style={[styles.inputContainer, { 
                backgroundColor: colors.card.background,
                borderWidth: 1,
                borderColor: error && password === '' ? colors.error : colors.border
              }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Password"
                  placeholderTextColor={colors.text}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  returnKeyType="next"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={colors.text} 
                  />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputContainer, { 
                backgroundColor: colors.card.background,
                borderWidth: 1,
                borderColor: error && confirmPassword === '' ? colors.error : colors.border
              }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Confirm Password"
                  placeholderTextColor={colors.text}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.passwordToggle}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={colors.text} 
                  />
                </TouchableOpacity>
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color={colors.error} />
                  <ThemedText style={styles.error}>{error}</ThemedText>
                </View>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors.primary },
                  isLoading && { opacity: 0.7 }
                ]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={20} color={colors.background} style={styles.buttonIcon} />
                    <ThemedText style={[styles.buttonText, { color: colors.background }]}>Sign Up</ThemedText>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={handleLoginPress}
                disabled={isLoading}
              >
                <ThemedText style={styles.loginText}>
                  Already have an account? <ThemedText style={[styles.loginHighlight, { color: colors.primary }]}>Login</ThemedText>
                </ThemedText>
              </TouchableOpacity>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    transform: [{ translateY: -10 }],
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17,
    opacity: 0.7,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22,
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
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  passwordToggle: {
    padding: 8,
    marginRight: -8,
    opacity: 0.7,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    marginTop: -8,
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    flex: 1,
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