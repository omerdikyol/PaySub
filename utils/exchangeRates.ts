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
      console.log(`Using cached rates for ${baseCurrency}:`, cached.rates);
      return cached.rates;
    }

    // Fetch fresh rates if no cache or expired
    console.log(`Fetching fresh rates for ${baseCurrency}`);
    const response = await fetch(`${EXCHANGE_RATE_API}${baseCurrency}`);
    
    if (!response.ok) {
      console.error(`Exchange rate API error: ${response.status} ${response.statusText}`);
      throw new Error(`Exchange rate API returned ${response.status}`);
    }

    const data = await response.json();
    console.log(`Received rates for ${baseCurrency}:`, data);

    if (!data.rates || typeof data.rates !== 'object') {
      console.error('Invalid API response format:', data);
      throw new Error('Invalid response format from exchange rate API');
    }

    // Cache the new rates
    await cacheRates(baseCurrency, data.rates);
    return data.rates;
  } catch (error) {
    console.error(`Error fetching exchange rates for ${baseCurrency}:`, error);
    
    // Try to use expired cache as fallback
    const expired = await getCachedRates(baseCurrency, true);
    if (expired) {
      console.log(`Using expired cache for ${baseCurrency}:`, expired.rates);
      return expired.rates;
    }

    // If no cache available, return a simple conversion rate of 1
    console.warn(`No rates available for ${baseCurrency}, using 1:1 conversion`);
    return { [baseCurrency]: 1 };
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

  try {
    console.log(`Converting ${amount} from ${fromCurrency} to ${toCurrency}`);
    const rates = await getExchangeRates(fromCurrency);
    const rate = rates[toCurrency];

    if (!rate) {
      console.error(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
      // If no rate is available, try the reverse conversion
      const reverseRates = await getExchangeRates(toCurrency);
      const reverseRate = reverseRates[fromCurrency];
      
      if (!reverseRate) {
        console.error(`No reverse rate found for ${toCurrency} to ${fromCurrency}`);
        throw new Error(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
      }

      // Use the inverse of the reverse rate
      const convertedAmount = amount * (1 / reverseRate);
      console.log(`Converted amount using reverse rate: ${convertedAmount}`);
      return convertedAmount;
    }

    const convertedAmount = amount * rate;
    console.log(`Converted amount: ${convertedAmount}`);
    return convertedAmount;
  } catch (error) {
    console.error(`Error converting currency from ${fromCurrency} to ${toCurrency}:`, error);
    // Return original amount as fallback
    return amount;
  }
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