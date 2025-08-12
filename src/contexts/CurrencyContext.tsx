'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CurrencyCode, SUPPORTED_CURRENCIES, convertCurrency, formatCurrency, getPricingInCurrency } from '@/lib/currency';

interface CurrencyContextType {
  currentCurrency: CurrencyCode;
  currencies: typeof SUPPORTED_CURRENCIES;
  changeCurrency: (currency: CurrencyCode) => void;
  convertPrice: (amount: number, fromCurrency?: CurrencyCode) => number;
  formatPrice: (amount: number, options?: { showSymbol?: boolean; minimumFractionDigits?: number; maximumFractionDigits?: number }) => string;
  getPricing: () => Record<string, { monthly: string; yearly: string }>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>('USD');

  // Detect user's preferred currency based on location
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferred-currency') as CurrencyCode;
    if (savedCurrency && SUPPORTED_CURRENCIES[savedCurrency]) {
      setCurrentCurrency(savedCurrency);
      return;
    }

    // Auto-detect currency based on locale
    try {
      const userLocale = navigator.language || 'en-US';
      const currencyFromLocale = getCurrencyFromLocale(userLocale);
      if (currencyFromLocale) {
        setCurrentCurrency(currencyFromLocale);
      }
    } catch (error) {
      console.log('Could not detect currency from locale, using USD');
    }
  }, []);

  const changeCurrency = (currency: CurrencyCode) => {
    setCurrentCurrency(currency);
    localStorage.setItem('preferred-currency', currency);
  };

  const convertPrice = (amount: number, fromCurrency: CurrencyCode = 'USD') => {
    return convertCurrency(amount, fromCurrency, currentCurrency);
  };

  const formatPrice = (
    amount: number, 
    options?: { showSymbol?: boolean; minimumFractionDigits?: number; maximumFractionDigits?: number }
  ) => {
    return formatCurrency(amount, currentCurrency, options);
  };

  const getPricing = () => {
    return getPricingInCurrency(currentCurrency);
  };

  const value = {
    currentCurrency,
    currencies: SUPPORTED_CURRENCIES,
    changeCurrency,
    convertPrice,
    formatPrice,
    getPricing,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Helper function to detect currency from locale
function getCurrencyFromLocale(locale: string): CurrencyCode | null {
  const localeMap: Record<string, CurrencyCode> = {
    'en-US': 'USD',
    'en-GB': 'GBP',
    'de': 'EUR',
    'de-DE': 'EUR',
    'fr': 'EUR',
    'fr-FR': 'EUR',
    'it': 'EUR',
    'it-IT': 'EUR',
    'es': 'EUR',
    'es-ES': 'EUR',
    'ja': 'JPY',
    'ja-JP': 'JPY',
    'th': 'THB',
    'th-TH': 'THB',
    'zh': 'CNY',
    'zh-CN': 'CNY',
    'zh-Hans': 'CNY',
    'ko': 'KRW',
    'ko-KR': 'KRW',
    'en-SG': 'SGD',
  };

  // Try exact match first
  if (localeMap[locale]) {
    return localeMap[locale];
  }

  // Try language code only
  const languageCode = locale.split('-')[0];
  if (localeMap[languageCode]) {
    return localeMap[languageCode];
  }

  return null;
}