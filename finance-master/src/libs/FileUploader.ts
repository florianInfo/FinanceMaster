import Papa from 'papaparse'
import { Transaction, TransactionType } from '@/types/Transaction'

function sanitizeFloat(value: any): number {
  const num = parseFloat(String(value).replace(',', '.'));
  return isNaN(num) ? 0 : num;
}

export function parseCsvToTransactions(csvContent: string, lastId: number): Transaction[] {
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  const data: Transaction[] = result.data.map((row: any, index: number): Transaction => {
    const debit = sanitizeFloat(row['Debit']);
    const credit = sanitizeFloat(row['Credit']);
    const amount = debit > 0 ? -debit : credit;

    const type: TransactionType = debit > 0 ? 'debit' : 'credit';

    const rawDate = row['Date'];
    const rawDesc = row['Description'] || row['Libellé'] || '';
    const rawCategory = row['Categorie'] || row['Catégorie'] || 'Autre';
    const baseCategory = String(rawCategory).trim();

    return {
      id: `${lastId + index + 1}`, // <- ID auto-incrémenté
      date: new Date(rawDate).toISOString().slice(0, 10),
      description: rawDesc.trim(),
      categories: rawCategory.split(',').map((c: string) => c.trim()).filter(Boolean),
      baseCategory,
      amount,
      type,
    };
  });

  return data;
}
