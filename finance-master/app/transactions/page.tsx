'use client'
import { useEffect, useState } from 'react';
import { useTransactions } from '../contexts/TransactionsContext';
import TransactionTable from '../components/TransactionTable';
import { Transaction } from '../types/Transaction';

export default function TransactionsPage() {
  const { transactions } = useTransactions();
  const [tableData, setTableData] = useState<Transaction[]>([]);

  useEffect(() => {
    setTableData([...transactions]);
  }, [transactions]);

  const handleSelectionChange = (selectedIds: string[]) => {
    console.log('Lignes sélectionnées :', selectedIds);
    // TODO: actions groupées (suppression, export, etc)
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Mes Transactions</h1>

      {/* Zone de filtres à venir ici */}
      <TransactionTable
        data={tableData}
        setData={setTableData}
        onSelectionChange={handleSelectionChange}
      />
    </main>
  );
}
