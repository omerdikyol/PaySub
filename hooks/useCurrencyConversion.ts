import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { convertCurrency } from '@/utils/exchangeRates';

export function useCurrencyConversion() {
  const [preferredCurrency, setPreferredCurrency] = useState('TRY');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load preferred currency on mount
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

  // Convert a single amount
  const convertAmount = async (
    amount: number,
    fromCurrency: string
  ): Promise<number> => {
    if (fromCurrency === preferredCurrency) {
      return amount;
    }

    setIsLoading(true);
    setError(null);

    try {
      const converted = await convertCurrency(
        amount,
        fromCurrency,
        preferredCurrency
      );
      return converted;
    } catch (error) {
      setError('Error converting currency');
      console.error('Currency conversion error:', error);
      return amount; // Return original amount on error
    } finally {
      setIsLoading(false);
    }
  };

  // Convert multiple amounts in different currencies
  const convertAmounts = async (
    items: Array<{ amount: number; currency: string }>
  ): Promise<number> => {
    setIsLoading(true);
    setError(null);

    try {
      const conversions = await Promise.all(
        items.map(item => convertAmount(item.amount, item.currency))
      );
      return conversions.reduce((sum, amount) => sum + amount, 0);
    } catch (error) {
      setError('Error converting currencies');
      console.error('Currency conversion error:', error);
      return items.reduce((sum, item) => sum + item.amount, 0); // Return sum of original amounts on error
    } finally {
      setIsLoading(false);
    }
  };

  // Format amount in preferred currency
  const formatInPreferredCurrency = (amount: number): string => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: preferredCurrency,
    }).format(amount);
  };

  return {
    preferredCurrency,
    isLoading,
    error,
    convertAmount,
    convertAmounts,
    formatInPreferredCurrency,
  };
} 