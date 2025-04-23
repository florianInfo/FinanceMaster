'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Transaction } from '@/types/Transaction';
import type { CategoryOption } from '@/types/CategoryOption';

interface TransactionsContextType {
  transactions: Transaction[];
  setTransactions: (txs: Transaction[]) => void;
  addTransactions: (txs: Transaction[]) => void;
  categories: CategoryOption[];
}

const LS_TX_KEY = 'finance-transactions';
const LS_CAT_COLOR_KEY = 'finance-category-colors';

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [catColors, setCatColors] = useState<Record<string, string>>({});

  // 1) Charger transactions
  useEffect(() => {
    const stored = localStorage.getItem(LS_TX_KEY);
    if (stored) setTransactions(JSON.parse(stored));
  }, []);

  // 2) Charger mapping catégorie→couleur
  useEffect(() => {
    const stored = localStorage.getItem(LS_CAT_COLOR_KEY);
    if (stored) setCatColors(JSON.parse(stored));
  }, []);

  // Générateur de couleur hex unique
  const generateUniqueColor = (existing: string[]) => {
    let color: string;
    do {
      color = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    } while (existing.includes(color));
    return color;
  };

  // 3) À chaque modification de transactions, mettre à jour le localStorage et reconstruire les catégories
  useEffect(() => {
    // Persist transactions
    localStorage.setItem(LS_TX_KEY, JSON.stringify(transactions));

    // Extraire noms uniques
    const uniqueCats = new Set<string>();
    transactions.forEach(tx => {
      tx.categories?.forEach(cat => uniqueCats.add(cat));
    });

    // Créer ou récupérer les couleurs
    const colorsMap = { ...catColors };
    let changed = false;
    Array.from(uniqueCats).forEach(cat => {
      if (!colorsMap[cat]) {
        const newColor = generateUniqueColor(Object.values(colorsMap));
        colorsMap[cat] = newColor;
        changed = true;
      }
    });
    if (changed) {
      setCatColors(colorsMap);
      localStorage.setItem(LS_CAT_COLOR_KEY, JSON.stringify(colorsMap));
    }

    // Construire le tableau d'options
    const opts: CategoryOption[] = Array.from(uniqueCats).map(cat => ({
      value: cat,
      label: cat,
      color: colorsMap[cat],
    }));
    setCategories(opts);
  }, [transactions, catColors]);

  const addTransactions = (newTxs: Transaction[]) => {
    setTransactions(prev => [...prev, ...newTxs]);
  };

  return (
    <TransactionsContext.Provider
      value={{ transactions, setTransactions, addTransactions, categories }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error('useTransactions must be used within TransactionsProvider');
  return ctx;
};
