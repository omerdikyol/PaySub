import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_ENDPOINTS } from '@/app/config/api';

interface User {
  id: string;
  email: string;
  name: string;
  defaultCurrency: string;
  language: string;
  notificationPreferences: {
    defaultEnabled: boolean;
    defaultDaysInAdvance: number;
    defaultTime: {
      hour: number;
      minute: number;
    };
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  defaultCurrency?: string;
  language?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user'),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const storeAuth = async (token: string, user: User) => {
    try {
      await Promise.all([
        AsyncStorage.setItem('token', token),
        AsyncStorage.setItem('user', JSON.stringify(user)),
      ]);
    } catch (error) {
      console.error('Error storing auth:', error);
    }
  };

  const clearAuth = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('token'),
        AsyncStorage.removeItem('user'),
      ]);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(API_URL + API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      await storeAuth(data.token, data.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      const response = await fetch(API_URL + API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setToken(data.token);
      setUser(data.user);
      await storeAuth(data.token, data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await clearAuth();
  };

  const updateProfile = async (updateData: Partial<User>) => {
    try {
      const response = await fetch(API_URL + API_ENDPOINTS.AUTH.PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Profile update failed');
      }

      setUser(data.user);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 