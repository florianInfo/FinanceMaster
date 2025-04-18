'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Transaction } from '../types/Transaction';

interface TransactionsContextType {
  transactions: Transaction[];
  setTransactions: (txs: Transaction[]) => void;
  addTransactions: (txs: Transaction[]) => void;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('finance-transactions');
    if (stored) setTransactions(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('finance-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransactions = (newTxs: Transaction[]) => {
    setTransactions((prev) => [...prev, ...newTxs]);
  };

  return (
    <TransactionsContext.Provider value={{ transactions, setTransactions, addTransactions }}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error('useTransactions must be used within TransactionsProvider');
  return ctx;
};
