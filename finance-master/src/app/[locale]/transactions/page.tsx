'use client'

import React, { useEffect, useState, useCallback } from 'react';
import { useTransactions } from '@/contexts/TransactionsContext';
import TransactionTable from '@/components/TransactionTable';
import { Transaction } from '@/types/Transaction';
import TransactionFilters, { TransactionFiltersValues } from '@/components/TransactionsFilter';
import { CategoryOption } from '@/types/CategoryOption';
import ConfirmModal from '@/components/ConfirmModal'; // Ajouté pour la modal
import { ModalConfigButton } from '@/types/ModalConfigButton';
import { div, tr } from 'framer-motion/client';
import { RotateCcw } from 'lucide-react';

export default function TransactionsPage() {
  const { transactions, setTransactions, categories } = useTransactions();

  const [filters, setFilters] = useState<TransactionFiltersValues>({
    startDate: '',
    endDate: '',
    categories: [],
    description: '',
    minAmount: '',
    maxAmount: '',
  });

  const [tableData, setTableData] = useState<Transaction[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hasTemporaryDeletions, setHasTemporaryDeletions] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalButtons, setModalButtons] = useState<ModalConfigButton[]>([]);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);

  // Filtrage dynamique
  useEffect(() => {
    const filtered = filterData(transactions)
    setTableData(filtered);
  }, [transactions, filters]);

  const filterData = (transactions: Transaction[]) => {
    return transactions.filter((tx) => {
      if (filters.startDate && new Date(tx.date) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(tx.date) > new Date(filters.endDate)) return false;
      if (filters.categories.length > 0 && !filters.categories.some(cat => tx.categories.includes(cat))) return false;
      if (filters.description && !tx.description.toLowerCase().includes(filters.description.toLowerCase())) return false;
      if (filters.minAmount !== '' && tx.amount < (filters.minAmount as number)) return false;
      if (filters.maxAmount !== '' && tx.amount > (filters.maxAmount as number)) return false;
      return true;
    });
  }

  const handleFiltersChange = useCallback((newFilters: TransactionFiltersValues) => {
    setFilters(newFilters);
  }, []);

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const handleDeleteRequest = (ids: string[]) => {
    console.log(ids)
    if (ids.length === 0) return;
    setIdsToDelete(ids);
    setModalMessage('Voulez-vous supprimer cette transaction de votre fichier de travail ou simplement de la vue courante ?');
    setModalTitle('Suppression')
    setModalButtons([
      { label: 'Supprimer définitivement', onClick: () => confirmPermanentDelete(ids), variant: 'primary' },
      { label: 'Supprimer temporairement', onClick: () => confirmTemporaryDelete(ids), variant: 'secondary' },
      { label: 'Annuler', onClick: () => setShowConfirmModal(false), variant: 'cancel' },
    ]);
    setShowConfirmModal(true);
  };
  const confirmPermanentDelete = (ids: string[]) => {
    console.log("delete permanent  : ", ids)
    const updatedTransactions = transactions.filter(tx => !ids.includes(tx.id));
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    setShowConfirmModal(false);
    setSelectedIds([]);
  };
  
  const confirmTemporaryDelete = (ids: string[]) => {
    console.log("delete temporary  : ", ids)
    const updatedTableData = tableData.filter(tx => !ids.includes(tx.id));
    setTableData(updatedTableData);
    setShowConfirmModal(false);
    setSelectedIds([]);
    setHasTemporaryDeletions(true);
  };

  const handleRefreshData = () => {
    setTableData(filterData(transactions))
    setHasTemporaryDeletions(false)
    setShowConfirmModal(false)
  }
  

  return (
    <main className="p-4 flex flex-col gap-2 relative">
      <h1 className="text-xl font-semibold mb-2">Mes Transactions</h1>

      <TransactionFilters
        categories={categories}
        initialValues={filters}
        onFiltersChange={handleFiltersChange}
      />

      {hasTemporaryDeletions && (
        <div className='flex justify-end'>
          <button
            onClick={() => {
              setModalMessage('Cette action resynchronisera toutes les données sauvegardées. Voulez-vous continuer ?');
              setModalButtons([
                { label: 'Oui', onClick: handleRefreshData, variant: 'primary' },
                { label: 'Non', onClick: () => setShowConfirmModal(false), variant: 'secondary' },
              ]);
              setShowConfirmModal(true);
            }}
            title='Rafraichir'
            className="flex gap-2 bg-(--color-primary) hover:bg-(--color-secondary) text-white cursor-pointer p-1 rounded-full"
          >
          <RotateCcw size={20}/>
          </button>
        </div>
      )}

      <TransactionTable
        data={tableData}
        setData={setTableData}
        onSelectionChange={handleSelectionChange}
        onDeleteSelected={handleDeleteRequest} // <-- important
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={modalTitle}
        message={modalMessage}
        buttons={modalButtons}
      />
    </main>
  );
}
