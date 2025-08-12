'use client';

import React, { useState } from 'react';
import { DollarSign, ChevronDown } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { CurrencyCode } from '@/lib/currency';
import { useTranslation } from 'react-i18next';

const CurrencySwitcher: React.FC = () => {
  const { currentCurrency, currencies, changeCurrency } = useCurrency();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentCurrencyInfo = currencies[currentCurrency];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        title={t('currency', 'Currency')}
      >
        <DollarSign className="h-5 w-5" />
        <span className="text-sm font-medium hidden sm:inline">
          {currentCurrencyInfo.flag} {currentCurrencyInfo.code}
        </span>
        <span className="text-sm font-medium sm:hidden">
          {currentCurrencyInfo.flag}
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-2 min-w-[200px] max-h-80 overflow-y-auto z-20">
            <div className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              {t('selectCurrency', 'Select Currency')}
            </div>
            {Object.entries(currencies).map(([code, info]) => (
              <button
                key={code}
                onClick={() => {
                  changeCurrency(code as CurrencyCode);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                  currentCurrency === code
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{info.flag}</span>
                  <div>
                    <div className="text-sm font-medium">{info.code}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {info.name}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {info.symbol}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CurrencySwitcher;