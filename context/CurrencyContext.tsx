import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { convertCurrency } from '@/utils/exchangeRates';

interface CurrencyContextType {
  preferredCurrency: string;
  setPreferredCurrency: (currency: string) => Promise<void>;
  convertAmount: (amount: number, fromCurrency: string) => Promise<number>;
  formatInPreferredCurrency: (amount: number) => string;
  isLoading: boolean;
  error: string | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [preferredCurrency, setPreferredCurrencyState] = useState('TRY');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreferredCurrency();
  }, []);

  const loadPreferredCurrency = async () => {
    try {
      const saved = await AsyncStorage.getItem('preferredCurrency');
      if (saved) {
        setPreferredCurrencyState(saved);
      }
    } catch (error) {
      console.error('Error loading preferred currency:', error);
    }
  };

  const setPreferredCurrency = async (currency: string) => {
    try {
      await AsyncStorage.setItem('preferredCurrency', currency);
      setPreferredCurrencyState(currency);
    } catch (error) {
      console.error('Error saving preferred currency:', error);
    }
  };

  const convertAmount = async (amount: number, fromCurrency: string): Promise<number> => {
    if (fromCurrency === preferredCurrency) {
      return amount;
    }

    setIsLoading(true);
    setError(null);

    try {
      const converted = await convertCurrency(amount, fromCurrency, preferredCurrency);
      return converted;
    } catch (error) {
      setError('Error converting currency');
      console.error('Currency conversion error:', error);
      return amount;
    } finally {
      setIsLoading(false);
    }
  };

  const formatInPreferredCurrency = (amount: number): string => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: preferredCurrency,
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider
      value={{
        preferredCurrency,
        setPreferredCurrency,
        convertAmount,
        formatInPreferredCurrency,
        isLoading,
        error,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
} 