// src/types/Transaction.ts
import type { CategoryOption } from './CategoryOption';

export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  id: string;
  date: string;            // ISO string
  description: string;
  categories: string[];  // <-- on stocke désormais des CategoryOption
  baseCategory: string;  // catégorie telle qu'importée depuis le CSV
  amount: number;
  type: TransactionType;
}
