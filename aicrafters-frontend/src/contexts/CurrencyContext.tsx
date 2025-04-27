import React, { createContext, useContext, useState, useCallback } from 'react';

export type Currency = 'MAD' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (price: number) => number;
  formatPrice: (price: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates (you might want to fetch these from an API in production)
const EXCHANGE_RATES = {
  MAD: 1,
  EUR: 0.095,
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('MAD');

  const convertPrice = useCallback((price: number) => {
    if (currency === 'MAD') return price;
    return price * EXCHANGE_RATES.EUR;
  }, [currency]);

  const formatPrice = useCallback((price: number) => {
    const convertedPrice = convertPrice(price);
    return `${convertedPrice.toFixed(2)} ${currency}`;
  }, [currency, convertPrice]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}; 