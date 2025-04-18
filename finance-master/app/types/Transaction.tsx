export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  id: string;
  date: string; // ISO string
  description: string;
  categories: string[]; // ex: ['Courses', 'Alimentation']
  amount: number;
  currency: string; // ex: EUR, USD
  type: TransactionType;
}
