import AsyncStorage from '@react-native-async-storage/async-storage';

const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/';
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour in milliseconds

interface ExchangeRateCache {
  rates: { [key: string]: number };
  timestamp: number;
  base: string;
}

// Get exchange rates for a base currency
export async function getExchangeRates(baseCurrency: string): Promise<{ [key: string]: number }> {
  try {
    // Check cache first
    const cached = await getCachedRates(baseCurrency);
    if (cached) {
      return cached.rates;
    }

    // Fetch fresh rates if no cache or expired
    const response = await fetch(`${EXCHANGE_RATE_API}${baseCurrency}`);
    const data = await response.json();

    if (data.rates) {
      // Cache the new rates
      await cacheRates(baseCurrency, data.rates);
      return data.rates;
    }

    throw new Error('Invalid response from exchange rate API');
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Return cached rates even if expired, or throw if no cache
    const expired = await getCachedRates(baseCurrency, true);
    if (expired) {
      return expired.rates;
    }
    throw error;
  }
}

// Convert amount from one currency to another
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rates = await getExchangeRates(fromCurrency);
  const rate = rates[toCurrency];

  if (!rate) {
    throw new Error(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
  }

  return amount * rate;
}

// Cache management functions
async function getCachedRates(
  baseCurrency: string,
  ignoreExpiry: boolean = false
): Promise<ExchangeRateCache | null> {
  try {
    const cached = await AsyncStorage.getItem(`exchangeRates_${baseCurrency}`);
    if (!cached) return null;

    const data: ExchangeRateCache = JSON.parse(cached);
    const now = Date.now();

    if (!ignoreExpiry && now - data.timestamp > CACHE_EXPIRY) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading cached rates:', error);
    return null;
  }
}

async function cacheRates(baseCurrency: string, rates: { [key: string]: number }): Promise<void> {
  try {
    const cache: ExchangeRateCache = {
      rates,
      timestamp: Date.now(),
      base: baseCurrency,
    };
    await AsyncStorage.setItem(`exchangeRates_${baseCurrency}`, JSON.stringify(cache));
  } catch (error) {
    console.error('Error caching rates:', error);
  }
} 