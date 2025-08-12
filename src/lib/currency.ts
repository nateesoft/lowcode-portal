import Dinero from 'dinero.js';

// Supported currencies with their exchange rates (relative to USD)
export const SUPPORTED_CURRENCIES = {
  USD: { 
    code: 'USD', 
    name: 'US Dollar', 
    symbol: '$', 
    flag: '🇺🇸', 
    rate: 1,
    locale: 'en-US'
  },
  EUR: { 
    code: 'EUR', 
    name: 'Euro', 
    symbol: '€', 
    flag: '🇪🇺', 
    rate: 0.92,
    locale: 'de-DE'
  },
  GBP: { 
    code: 'GBP', 
    name: 'British Pound', 
    symbol: '£', 
    flag: '🇬🇧', 
    rate: 0.79,
    locale: 'en-GB'
  },
  JPY: { 
    code: 'JPY', 
    name: 'Japanese Yen', 
    symbol: '¥', 
    flag: '🇯🇵', 
    rate: 148,
    locale: 'ja-JP'
  },
  THB: { 
    code: 'THB', 
    name: 'Thai Baht', 
    symbol: '฿', 
    flag: '🇹🇭', 
    rate: 34.5,
    locale: 'th-TH'
  },
  CNY: { 
    code: 'CNY', 
    name: 'Chinese Yuan', 
    symbol: '¥', 
    flag: '🇨🇳', 
    rate: 7.23,
    locale: 'zh-CN'
  },
  KRW: { 
    code: 'KRW', 
    name: 'South Korean Won', 
    symbol: '₩', 
    flag: '🇰🇷', 
    rate: 1340,
    locale: 'ko-KR'
  },
  SGD: { 
    code: 'SGD', 
    name: 'Singapore Dollar', 
    symbol: 'S$', 
    flag: '🇸🇬', 
    rate: 1.35,
    locale: 'en-SG'
  }
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

// Convert price from USD to target currency
export function convertCurrency(
  amount: number, 
  fromCurrency: CurrencyCode = 'USD', 
  toCurrency: CurrencyCode
): number {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = SUPPORTED_CURRENCIES[fromCurrency].rate;
  const toRate = SUPPORTED_CURRENCIES[toCurrency].rate;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}

// Format currency with proper locale and symbol
export function formatCurrency(
  amount: number, 
  currency: CurrencyCode,
  options?: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const currencyInfo = SUPPORTED_CURRENCIES[currency];
  const {
    showSymbol = true,
    minimumFractionDigits = currency === 'JPY' || currency === 'KRW' ? 0 : 2,
    maximumFractionDigits = currency === 'JPY' || currency === 'KRW' ? 0 : 2
  } = options || {};

  try {
    const formatter = new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits,
      maximumFractionDigits
    });
    
    return formatter.format(amount);
  } catch (error) {
    // Fallback formatting
    const formattedAmount = amount.toLocaleString(currencyInfo.locale, {
      minimumFractionDigits,
      maximumFractionDigits
    });
    
    return showSymbol ? `${currencyInfo.symbol}${formattedAmount}` : formattedAmount;
  }
}

// Get currency display name with flag
export function getCurrencyDisplayName(currency: CurrencyCode): string {
  const info = SUPPORTED_CURRENCIES[currency];
  return `${info.flag} ${info.code} - ${info.name}`;
}

// Pricing tiers in USD (base prices)
export const BASE_PRICING = {
  Junior: { monthly: 0, yearly: 0 },
  Senior: { monthly: 10, yearly: 100 },
  Specialist: { monthly: 100, yearly: 1000 }
} as const;

// Convert pricing to target currency
export function getPricingInCurrency(currency: CurrencyCode) {
  const pricing: Record<string, { monthly: string; yearly: string }> = {};
  
  Object.entries(BASE_PRICING).forEach(([tier, prices]) => {
    const monthlyConverted = convertCurrency(prices.monthly, 'USD', currency);
    const yearlyConverted = convertCurrency(prices.yearly, 'USD', currency);
    
    pricing[tier] = {
      monthly: prices.monthly === 0 ? 'Free' : formatCurrency(monthlyConverted, currency),
      yearly: prices.yearly === 0 ? 'Free' : formatCurrency(yearlyConverted, currency)
    };
  });
  
  return pricing;
}