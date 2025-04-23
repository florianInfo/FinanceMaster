"use client"
import React, { useEffect, useState } from 'react';
import { useTransactions } from '@/contexts/TransactionsContext';
import TransactionTable from '@/components/TransactionTable';
import { Transaction } from '@/types/Transaction';
import TransactionFilters, {TransactionFiltersValues } from '@/components/TransactionsFilter';
import { CategoryOption } from '@/types/CategoryOption';

export default function TransactionsPage() {
  const { transactions, categories } = useTransactions();

  // État des filtres
  const [filters, setFilters] = useState<TransactionFiltersValues>({
    startDate: '',
    endDate: '',
    categories: [],
    description: '',
    minAmount: '',
    maxAmount: '',
  });

  // Données filtrées pour la table
  const [tableData, setTableData] = useState<Transaction[]>([]);

  // Applique le filtrage à chaque mise à jour des transactions ou des filtres
  useEffect(() => {
    const filtered = transactions.filter((tx) => {
      // Filtre par date
      if (filters.startDate && new Date(tx.date) < new Date(filters.startDate)) {
        return false;
      }
      if (filters.endDate && new Date(tx.date) > new Date(filters.endDate)) {
        return false;
      }

      // Filtre par catégories
      if (filters.categories.length > 0 && !filters.categories.some(cat => tx.categories.includes(cat))) {
        return false;
      }

      // Filtre par description (recherche insensible à la casse)
      if (
        filters.description &&
        !tx.description.toLowerCase().includes(filters.description.toLowerCase())
      ) {
        return false;
      }

      // Filtre par montant minimum
      if (
        filters.minAmount !== '' &&
        tx.amount < (filters.minAmount as number)
      ) {
        return false;
      }

      // Filtre par montant maximum
      if (
        filters.maxAmount !== '' &&
        tx.amount > (filters.maxAmount as number)
      ) {
        return false;
      }

      return true;
    });
    console.log(filtered)
    setTableData(filtered);
  }, [transactions, filters]);

  // Mise à jour des filtres
  const handleFiltersChange = (newFilters: TransactionFiltersValues) => {
    setFilters(newFilters);
  };

  // Gestion de la sélection des lignes
  const handleSelectionChange = (selectedIds: string[]) => {
    console.log('Lignes sélectionnées :', selectedIds);
    // TODO: actions groupées (suppression, export, etc.)
  };

  return (
    <main className="p-4 flex flex-col gap-2">
      <h1 className="text-xl font-semibold mb-2">Mes Transactions</h1>

      <TransactionFilters
        categories={categories}
        initialValues={filters}
        onFiltersChange={handleFiltersChange}
      />

      <TransactionTable
        data={tableData}
        setData={setTableData}
        onSelectionChange={handleSelectionChange}
      />
    </main>
  );
}
