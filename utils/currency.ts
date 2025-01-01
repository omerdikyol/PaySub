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

export function formatCurrency(amount: number, currency: string = 'TRY'): string {
  // Format with thousand separators and proper decimal places
  const formatted = amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}

export function parseCurrencyInput(input: string): number {
  // Remove everything except numbers and comma
  const cleanedInput = input.replace(/[^\d,]/g, '');
  // Replace comma with dot for parseFloat
  const normalized = cleanedInput.replace(',', '.');
  // Parse the number
  return parseFloat(normalized);
}