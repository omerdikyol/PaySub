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

export function formatCurrency(amount: number, currencyCode: string = 'TRY'): string {
  const currency = currencies[currencyCode] || currencies.TRY;
  
  // Convert to string with maximum precision to avoid rounding
  const wholeNumber = Math.floor(amount);
  const decimal = Math.round((amount - wholeNumber) * 100);
  
  // Format whole number with thousand separators
  const formattedWhole = wholeNumber
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousand);
  
  // Format decimal part with leading zero if needed
  const formattedDecimal = decimal.toString().padStart(2, '0');
  
  const formatted = `${formattedWhole}${currency.decimal}${formattedDecimal}`;

  return currency.position === 'before' 
    ? `${currency.symbol}${formatted}`
    : `${formatted} ${currency.symbol}`;
}

export function parseCurrencyInput(value: string, currencyCode: string = 'TRY'): number {
  const currency = currencies[currencyCode] || currencies.TRY;
  
  // Remove all thousand separators and convert decimal separator to dot
  const normalizedValue = value
    .replace(new RegExp('\\' + currency.thousand, 'g'), '')
    .replace(currency.decimal, '.');
  
  // Parse as float with fixed precision
  const numberValue = parseFloat(normalizedValue);
  
  // Return with 2 decimal places
  return Math.round(numberValue * 100) / 100;
}