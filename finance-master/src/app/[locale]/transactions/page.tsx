'use client'

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useTransactions } from '@/contexts/TransactionsContext';
import TransactionTable from '@/components/TransactionTable';
import { Transaction } from '@/types/Transaction';
import TransactionFilters, { TransactionFiltersValues } from '@/components/TransactionsFilter';
import ConfirmModal from '@/components/ConfirmModal';
import { ModalConfigButton } from '@/types/ModalConfigButton';
import { RotateCcw } from 'lucide-react';
import { Snackbar } from '@/components/Snackbar';
import CategoryAddComponent from '@/components/CategoryAddComponent';
import CategoryAddPopup from '@/components/CategoryAddPopup';
import dayjs from 'dayjs';

export default function TransactionsPage() {
  const t = useTranslations('Transactions');
  const { transactions, setTransactions, categories } = useTransactions();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [undoAction, setUndoAction] = useState<(() => void) | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [filters, setFilters] = useState<TransactionFiltersValues>({
    startDate: '',
    endDate: '',
    categories: [],
    description: '',
    minAmount: '',
    maxAmount: '',
  });

  const [tableData, setTableData] = useState<Transaction[]>([]);
  const [hasTemporaryDeletions, setHasTemporaryDeletions] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalButtons, setModalButtons] = useState<ModalConfigButton[]>([]);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [idsSelected, setIdsSelected] = useState<string[]>([]);
  const [showAddCategoryPopup, setShowAddCategoryPopup] = useState(false);
  const [targetTransactionId, setTargetTransactionId] = useState<string | null>(null);


  useEffect(() => {
    const filtered = filterData(transactions);
    setTableData(filtered);
  }, [transactions, filters]);

  const filterData = (transactions: Transaction[]) => {
    return transactions.filter((tx) => {
      const txDate = dayjs(tx.date)
      const startDate = filters.startDate ? dayjs(filters.startDate) : null
      const endDate = filters.endDate ? dayjs(filters.endDate) : null
  
      if (startDate && txDate.isBefore(startDate.add(-1, 'day'), 'day')) return false
      if (endDate && !txDate.isBefore(endDate, 'day')) return false
  
      if (
        filters.categories.length > 0 &&
        !filters.categories.some(cat => tx.categories.includes(cat))
      ) return false
  
      if (
        filters.description &&
        !tx.description.toLowerCase().includes(filters.description.toLowerCase())
      ) return false
  
      if (filters.minAmount !== '' && tx.amount < (filters.minAmount as number)) return false
      if (filters.maxAmount !== '' && tx.amount > (filters.maxAmount as number)) return false
  
      return true
    })
  }
  const handleFiltersChange = useCallback((newFilters: TransactionFiltersValues) => {
    setFilters(newFilters);
  }, []);

  /** ADD Categories */
  const handleAddCategory = (categoriesId: string[], transactionIds: string[] | null) => {
    if(!transactionIds) return
    if (transactionIds.length > 1) {
      applyCategoriesToTransactions(idsSelected, categoriesId);
    } else {
      const baseTransaction = transactions.find(tx => tx.id === transactionIds[0]);
      if (!baseTransaction) return;

      const similarTransactions = findSimilarTransactions(baseTransaction).filter((tx: Transaction) =>
        categoriesId.some(categoryId => !tx.categories.includes(categoryId))
      );

      console.log(similarTransactions)

      if (similarTransactions.length > 0) {
        openConfirmationModal(
          t('confirmApplyToAllTitle'),
          t('confirmApplyToAllMessage', { count: similarTransactions.length }),
          [
            {
              label: t('yes'),
              onClick: () => applyCategoriesToTransactions([...transactionIds, ...similarTransactions.map(tx => tx.id)], categoriesId),
              variant: 'primary'
            },
            {
              label: t('no'),
              onClick: () => applyCategoriesToTransactions(transactionIds, categoriesId),
              variant: 'secondary'
            },
            {
              label: t('cancel'),
              onClick: () => setShowConfirmModal(false),
              variant: 'cancel'
            }
          ]
        );
      } else {
        applyCategoriesToTransactions(transactionIds, categoriesId);
      }
    }
  };

  const applyCategoriesToTransactions = (transactionIds: string[], categoryIds: string[]) => {
    const addedCategoriesMap: Record<string, string[]> = {};
    const updatedTransactions = transactions.map(tx => {
      if (transactionIds.includes(tx.id)) {
        const newCategories = categoryIds.filter(catId => !tx.categories.includes(catId));
        if (newCategories.length > 0) {
          addedCategoriesMap[tx.id] = newCategories;
          return { ...tx, categories: [...tx.categories, ...newCategories] };
        }
      }
      return tx;
    });
    setTransactions(updatedTransactions);
    setShowAddCategoryPopup(false)
    createUndo(t('categoriesAdded'), () => {
      setTransactions(prev =>
        prev.map(tx => {
          const addedCategories = addedCategoriesMap[tx.id];
          if (addedCategories) {
            return { ...tx, categories: tx.categories.filter(cat => !addedCategories.includes(cat)) };
          }
          return tx;
        })
      );
    });
  };

  const handleDeleteRequest = (ids: string[]) => {
    if (ids.length === 0) return;
    setIdsToDelete(ids);
    openConfirmationModal(
      t('deleteTitle'),
      t('deleteMessage'),
      [
        { label: t('deletePermanent'), onClick: () => confirmPermanentDelete(ids), variant: 'primary' },
        { label: t('deleteTemporary'), onClick: () => confirmTemporaryDelete(ids), variant: 'secondary' },
        { label: t('cancel'), onClick: () => setShowConfirmModal(false), variant: 'cancel' },
      ]
    );
  };

  const confirmPermanentDelete = (ids: string[]) => {
    const updatedTransactions = transactions.filter(tx => !ids.includes(tx.id));
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    setShowConfirmModal(false);
  };

  const confirmTemporaryDelete = (ids: string[]) => {
    const updatedTableData = tableData.filter(tx => !ids.includes(tx.id));
    setTableData(updatedTableData);
    setShowConfirmModal(false);
    setHasTemporaryDeletions(true);
  };

  const handleRemoveCategory = (txSelectedIds: string[], txId: string, categoryId: string) => {
    if(!txSelectedIds) return
    if(!txSelectedIds.includes(txId)) txSelectedIds = [txId]
    if (txSelectedIds.length > 1 ) {
      removeCategoryFromMultiple(txSelectedIds, categoryId);
    } else {
      const baseTransaction = transactions.find(tx => tx.id === txSelectedIds[0]);
      if (!baseTransaction) return;

      const similar = findSimilarTransactions(baseTransaction).filter((tx: Transaction) =>
        tx.categories.includes(categoryId)
      );

      if (similar.length > 0) {
        openConfirmationModal(
          t('confirmRemoveAllTitle'),
          t('confirmRemoveAllMessage', { count: similar.length }),
          [
            { label: t('yes'), onClick: () => removeCategoryFromMultiple([txSelectedIds[0], ...similar.map(tx => tx.id)], categoryId), variant: 'primary' },
            { label: t('no'), onClick: () => removeCategoryFromOne(txSelectedIds[0], categoryId), variant: 'secondary' }
          ]
        );
      } else {
        removeCategoryFromOne(txSelectedIds[0], categoryId);
      }
    }
  };

  const removeCategoryFromOne = (transactionId: string, categoryId: string) => {
    setTransactions(prev =>
      prev.map(tx =>
        tx.id === transactionId
          ? { ...tx, categories: tx.categories.filter(cat => cat !== categoryId) }
          : tx
      )
    );
    createUndo(t('categoryRemoved'), () => {
      setTransactions(prev =>
        prev.map(tx =>
          tx.id === transactionId
            ? { ...tx, categories: [...tx.categories, categoryId] }
            : tx
        )
      );
    });
  };

  const removeCategoryFromMultiple = (transactionIds: string[], categoryId: string) => {
    const transactionFiltered = transactions.filter(tx => transactionIds.includes(tx.id) && tx.categories.includes(categoryId)).map(tx => tx.id);
    setTransactions(prev =>
      prev.map(tx =>
        transactionFiltered.includes(tx.id)
          ? { ...tx, categories: tx.categories.filter(cat => cat !== categoryId) }
          : tx
      )
    );
    createUndo(t('categoryRemoved'), () => {
      setTransactions(prev =>
        prev.map(tx =>
          transactionFiltered.includes(tx.id)
            ? { ...tx, categories: [...tx.categories, categoryId] }
            : tx
        )
      );
    });
  };

  const createUndo = (message: string, undoFn: () => void) => {
    setUndoAction(() => undoFn);
    setSnackbarMessage(message);
    setShowSnackbar(true);
  };

  const findSimilarTransactions = (baseTransaction: Transaction) => {
    return transactions.filter(tx =>
      tx.description === baseTransaction.description &&
      (tx.amount < 0) === (baseTransaction.amount < 0) &&
      tx.id !== baseTransaction.id
    );
  };

  const openConfirmationModal = (title: string, message: string, buttons: ModalConfigButton[]) => {
    setModalMessage(message);
    setModalTitle(title);
    setModalButtons(buttons);
    setShowConfirmModal(true);
  };

  
  const handleAddCategoryPopup = (categoriesId: string[]) =>{
    handleAddCategory(categoriesId, [targetTransactionId])
  }

  const handleAddCategoryComponent = (categoriesId: string[]) =>{
    handleAddCategory(categoriesId, [...idsSelected])
  }

  const openCategoryPopup = (id: string) => {
    setTargetTransactionId(id)
    setShowAddCategoryPopup(true);
  };

  const handleRefreshData = () => {
    setTableData(filterData(transactions));
    setHasTemporaryDeletions(false);
    setShowConfirmModal(false);
  };

  return (
    <main className="p-4 flex flex-col gap-2 relative">
      <h1 className="text-xl font-semibold mb-2">{t('title')}</h1>

      <TransactionFilters
        categories={categories}
        initialValues={filters}
        onFiltersChange={handleFiltersChange}
      />

      {hasTemporaryDeletions && (
        <div className='flex justify-end'>
          <button
            onClick={() => {
              setModalMessage(t('refreshConfirm'));
              setModalButtons([
                { label: t('yes'), onClick: handleRefreshData, variant: 'primary' },
                { label: t('no'), onClick: () => setShowConfirmModal(false), variant: 'secondary' },
              ]);
              setShowConfirmModal(true);
            }}
            title={t('refresh')}
            className="flex gap-2 bg-(--color-primary) hover:bg-(--color-secondary) text-white cursor-pointer p-1 rounded-full"
          >
            <RotateCcw size={20}/>
          </button>
        </div>
      )}

     
        <CategoryAddComponent
          categories={categories}
          onAddCategory={handleAddCategoryComponent}
          disabled={idsSelected.length <= 0}
          refreshOnApply={true}
        />

      <TransactionTable
        data={tableData}
        setData={setTableData}
        onSelectionChange={setIdsSelected}
        onDeleteSelected={handleDeleteRequest}
        onRemoveCategory={handleRemoveCategory}
        onAddCategoriesClick={openCategoryPopup}
      />

      <CategoryAddPopup
        isOpen={showAddCategoryPopup}
        onClose={() => {
          setShowAddCategoryPopup(false)
          setIdsSelected([])
        }}
        onAdd={handleAddCategoryPopup}
        categories={categories}
        transaction={transactions.find(tx => tx.id == targetTransactionId)}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={modalTitle}
        message={modalMessage}
        buttons={modalButtons}
      />

      {showSnackbar && (
        <div className="relative">
          <Snackbar
            message={snackbarMessage}
            onUndo={() => {
              undoAction?.();
              setShowSnackbar(false);
            }}
            onClose={() => setShowSnackbar(false)}
          />
        </div>
      )}
    </main>
  );
}