type Currency = {
  code: string;
  symbol: string;
  position: 'before' | 'after';
  decimal: string;
  thousand: string;
  flag: string;
  name: string;
};

export const currencies: { [key: string]: Currency } = {
  TRY: {
    code: 'TRY',
    symbol: '₺',
    position: 'after',
    decimal: ',',
    thousand: '.',
    flag: '🇹🇷',
    name: 'Turkish Lira'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    position: 'before',
    decimal: '.',
    thousand: ',',
    flag: '🇺🇸',
    name: 'US Dollar'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    position: 'before',
    decimal: ',',
    thousand: '.',
    flag: '🇪🇺',
    name: 'Euro'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    position: 'before',
    decimal: '.',
    thousand: ',',
    flag: '🇬🇧',
    name: 'British Pound'
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    position: 'before',
    decimal: '.',
    thousand: ',',
    flag: '🇯🇵',
    name: 'Japanese Yen'
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    position: 'before',
    decimal: '.',
    thousand: ',',
    flag: '🇦🇺',
    name: 'Australian Dollar'
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    position: 'before',
    decimal: '.',
    thousand: ',',
    flag: '🇨🇦',
    name: 'Canadian Dollar'
  },
  CHF: {
    code: 'CHF',
    symbol: 'Fr',
    position: 'after',
    decimal: '.',
    thousand: ',',
    flag: '🇨🇭',
    name: 'Swiss Franc'
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    position: 'before',
    decimal: '.',
    thousand: ',',
    flag: '🇨🇳',
    name: 'Chinese Yuan'
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    position: 'before',
    decimal: '.',
    thousand: ',',
    flag: '🇮🇳',
    name: 'Indian Rupee'
  }
};

// Helper function to convert display format to internal numeric value
export function displayToNumeric(displayValue: string, currencyConfig: Currency): number {
  // First, identify which decimal separator is actually being used in the input
  // by checking if there's a comma or period after a digit
  const hasCommaDecimal = /\d,\d/.test(displayValue);
  const hasPeriodDecimal = /\d\.\d/.test(displayValue);
  
  let normalized = displayValue;
  
  if (hasCommaDecimal) {
    // Input uses comma as decimal
    normalized = normalized.replace(/\./g, ''); // Remove thousand dots
    normalized = normalized.replace(',', '.'); // Convert decimal comma to period
  } else if (hasPeriodDecimal) {
    // Input uses period as decimal
    normalized = normalized.replace(/,/g, ''); // Remove thousand commas
  } else {
    // No decimal separator found, use currency's default
    if (currencyConfig.decimal === ',') {
      normalized = normalized.replace(/\./g, '');
      normalized = normalized.replace(',', '.');
    } else {
      normalized = normalized.replace(/,/g, '');
    }
  }
  
  // Parse the normalized value
  const result = parseFloat(normalized);
  return isNaN(result) ? 0 : result;
}

// Helper function to convert internal numeric value to display format
export function numericToDisplay(numericValue: number, currencyConfig: Currency): string {
  // Convert to string with fixed 2 decimal places
  const parts = numericValue.toFixed(2).split('.');
  
  // Format whole part with thousand separators
  const formattedWhole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currencyConfig.thousand);
  
  // Combine with decimal part using currency's decimal separator
  return `${formattedWhole}${currencyConfig.decimal}${parts[1]}`;
}

export function formatCurrency(amount: number, currency: string = 'TRY'): string {
  const currencyConfig = currencies[currency];
  
  // Format with thousand separators and proper decimal places
  const formatted = amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Add symbol based on position
  return currencyConfig.position === 'before'
    ? `${currencyConfig.symbol}${formatted}`
    : `${formatted}${currencyConfig.symbol}`;
}

export function parseCurrencyInput(input: string): number {
  // Remove everything except numbers and comma
  const cleanedInput = input.replace(/[^\d,]/g, '');
  // Replace comma with dot for parseFloat
  const normalized = cleanedInput.replace(',', '.');
  // Parse the number
  return parseFloat(normalized);
}