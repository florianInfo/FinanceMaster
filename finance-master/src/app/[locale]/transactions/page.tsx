'use client'

import React, { useEffect, useState, useCallback } from 'react';
import { useTransactions } from '@/contexts/TransactionsContext';
import TransactionTable from '@/components/TransactionTable';
import { Transaction } from '@/types/Transaction';
import TransactionFilters, { TransactionFiltersValues } from '@/components/TransactionsFilter';
import ConfirmModal from '@/components/ConfirmModal'; // Ajouté pour la modal
import { ModalConfigButton } from '@/types/ModalConfigButton';
import { RotateCcw } from 'lucide-react';
import { Snackbar } from '@/components/Snackbar';
import CategoryAddComponent from '@/components/CategoryAddComponent';

export default function TransactionsPage() {
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

  /* FILTERS **/
  useEffect(() => {
    const filtered = filterData(transactions)
    setTableData(filtered);
  }, [transactions, filters]);

  const filterData = (transactions: Transaction[]) => {
    console.log(filters)
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

  /** ADD CATEGORIES */
  const handleAddCategory = (categoriesId: string[]) => {
    console.log(idsSelected);
    if (idsSelected.length > 1) {
      applyCategoriesToTransactions(idsSelected, categoriesId);
    } else {
      const baseTransaction = transactions.find(tx => tx.id === idsSelected[0]);
  
      if (!baseTransaction) return;
  
      const similarTransactions = findSimilarTransactions(baseTransaction).filter((tx: Transaction) =>
        categoriesId.some(categoryId => !tx.categories.includes(categoryId))
      );
  
      if (similarTransactions.length > 0) {
        openConfirmationModal(
          'Appliquer la catégorie à toutes les transactions similaires ?',
          `${similarTransactions.length} transactions similaires ont été trouvées. Voulez-vous appliquer la catégorie à toutes ces transactions ?`,
          [
            {
              label: 'Oui',
              onClick: () => applyCategoriesToTransactions([...idsSelected, ...similarTransactions.map(tx => tx.id)], categoriesId),
              variant: 'primary'
            },
            {
              label: 'Non',
              onClick: () => applyCategoriesToTransactions(idsSelected, categoriesId),
              variant: 'secondary'
            },
            {
              label: 'Annuler',
              onClick: () => setShowConfirmModal(false),
              variant: 'cancel'
            }
          ]
        );
      } else {
        applyCategoriesToTransactions(idsSelected, categoriesId);
      }
    }
  };
  
  
  
  const applyCategoriesToTransactions = (transactionIds: string[], categoryIds: string[]) => {
    // Dictionnaire pour suivre les catégories ajoutées par transaction
    const addedCategoriesMap: Record<string, string[]> = {};
  
    const updatedTransactions = transactions.map(tx => {
      if (transactionIds.includes(tx.id)) {
        // Identifier les nouvelles catégories à ajouter
        const newCategories = categoryIds.filter(catId => !tx.categories.includes(catId));
  
        if (newCategories.length > 0) {
          addedCategoriesMap[tx.id] = newCategories;
          return { ...tx, categories: [...tx.categories, ...newCategories] };
        }
      }
      return tx;
    });
  
    setTransactions(updatedTransactions);
  
    // Configuration de l'annulation
    createUndo('Catégories ajoutées.', () => {
      setTransactions(prev =>
        prev.map(tx => {
          const addedCategories = addedCategoriesMap[tx.id];
          if (addedCategories) {
            return {
              ...tx,
              categories: tx.categories.filter(cat => !addedCategories.includes(cat))
            };
          }
          return tx;
        })
      );
    });
  };
  
  
  


  /** DELETE TRANSACTION */
  const handleDeleteRequest = (ids: string[]) => {
    if (ids.length === 0) return;
    setIdsToDelete(ids);
    openConfirmationModal(
      'Suppression',
      'Voulez-vous supprimer cette transaction de votre fichier de travail ou simplement de la vue courante ?',
      [
        { label: 'Supprimer définitivement', onClick: () => confirmPermanentDelete(ids), variant: 'primary' },
        { label: 'Supprimer temporairement', onClick: () => confirmTemporaryDelete(ids), variant: 'secondary' },
        { label: 'Annuler', onClick: () => setShowConfirmModal(false), variant: 'cancel' },
      ]
    )
  };

  const confirmPermanentDelete = (ids: string[]) => {
    console.log("delete permanent  : ", ids)
    const updatedTransactions = transactions.filter(tx => !ids.includes(tx.id));
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    setShowConfirmModal(false);
  };
  
  const confirmTemporaryDelete = (ids: string[]) => {
    console.log("delete temporary  : ", ids)
    const updatedTableData = tableData.filter(tx => !ids.includes(tx.id));
    setTableData(updatedTableData);
    setShowConfirmModal(false);
    setHasTemporaryDeletions(true);
  };

  /** DELETE CATEGORY */
  const handleRemoveCategory = (selectedIds: string[], transactionId: string, categoryId: string) => {
    console.log(selectedIds)
    if (selectedIds.length > 1 && selectedIds.includes(transactionId)) {
      removeCategoryFromMultiple(selectedIds, categoryId);
    } else {
      const baseTransaction = transactions.find(tx => tx.id === transactionId);
      if (!baseTransaction) return;
      const similar = findSimilarTransactions(baseTransaction).filter((tx: Transaction) =>
        tx.categories.includes(categoryId)
      );
  
      if (similar.length > 0) {
        openConfirmationModal(
          `Retirer la catégorie partout ?`,
          `${similar.length} transactions similaires contiennent aussi cette catégorie. Voulez-vous la retirer partout ?`,
          [
            { label: 'Oui', onClick: () => removeCategoryFromMultiple(
              [transactionId, ...similar.map((t: Transaction) => t.id)],
              categoryId
            ), variant: 'primary' },
            { label: 'Non', onClick: () => removeCategoryFromOne(transactionId, categoryId), variant: 'secondary' }
          ]
        );
      } else {
        removeCategoryFromOne(transactionId, categoryId);
      }
    }
  };
  
  const removeCategoryFromOne = (transactionId: string, categoryId: string) => {
    setTransactions((prev: Transaction[]) =>
      prev.map(tx =>
        tx.id === transactionId
          ? { ...tx, categories: tx.categories.filter(cat => cat !== categoryId) }
          : tx
      )
    );
    createUndo('Catégorie retirée.', () => {
      setTransactions((prev: Transaction[]) =>
        prev.map(tx =>
          tx.id === transactionId
            ? { ...tx, categories: [...tx.categories, categoryId] }
            : tx
        )
      );
    });
  };
  
  const removeCategoryFromMultiple = (transactionIds: string[], categoryId: string) => {
    const transactionFiltred = transactions.filter(tx => transactionIds.includes(tx.id) && tx.categories.includes(categoryId)).map(tx => tx.id)
    setTransactions(prev =>
      prev.map(tx =>
        transactionFiltred.includes(tx.id)
          ? { ...tx, categories: tx.categories.filter(cat => cat !== categoryId) }
          : tx
      )
    );
    createUndo('Catégorie retirée.', () => {
      setTransactions(prev =>
        prev.map(tx =>
          transactionFiltred.includes(tx.id)
            ? { ...tx, categories: [...tx.categories, categoryId] }
            : tx
        )
      );
    });
  };

  /** UTILS*/
  
  const createUndo = (message: string, undoFn: () => void) => {
    setUndoAction(() => undoFn);
    setSnackbarMessage(message);
    setShowSnackbar(true);
  };
  
  const findSimilarTransactions = (baseTransaction: Transaction) => {
    return transactions.filter(tx =>
      tx.description === baseTransaction.description &&
      (tx.amount < 0) === (baseTransaction.amount < 0)
      && tx.id != baseTransaction.id
    );
  };

  const openConfirmationModal = (title: string, message: string, buttons: ModalConfigButton[]) => {
    setModalMessage(message);
    setModalTitle(title)
    setModalButtons(buttons);
    setShowConfirmModal(true);
  }

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

      {idsSelected.length > 0 && 
        <CategoryAddComponent
          categories={categories}
          onAddCategory={handleAddCategory}
        />
      }

      <TransactionTable
        data={tableData}
        setData={setTableData}
        onSelectionChange={setIdsSelected}
        onDeleteSelected={handleDeleteRequest} 
        onRemoveCategory={handleRemoveCategory}// <-- important
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
