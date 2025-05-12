'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'EUR' | 'USD' | 'CAD';

export const SUPPORTED_CURRENCIES: Currency[] = ['EUR', 'USD', 'CAD'];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('CAD');

  useEffect(() => {
    const stored = localStorage.getItem('finance-currency');
    if (SUPPORTED_CURRENCIES.includes(stored as Currency)) {
      setCurrencyState(stored as Currency);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    localStorage.setItem('finance-currency', newCurrency);
    setCurrencyState(newCurrency);
  };

  const getCurrencySymbol = () => {
    switch (currency) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'CAD': return 'CA$';
      default: return currency;
    }
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, getCurrencySymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}
