'use client';

import { Globe, PaintBucket, Download, HardDriveUpload } from 'lucide-react';
import { useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { parseCsvToTransactions } from '@/libs/FileUploader';
import { useTransactions } from '@/contexts/TransactionsContext';
import CurrencySelector from './CurrencySelector';
import LanguageSelector from './LanguageSelector';
import { useTranslations } from 'next-intl';
import ConfirmModal from '@/components/ConfirmModal';
import type { ModalConfigButton } from '@/types/ModalConfigButton';
import type { Transaction } from '@/types/Transaction';

const THEMES = [
  { name: 'dark-red', color: 'bg-black border-red-500' },
  { name: 'light-red', color: 'bg-white border-red-500' },
  { name: 'dark-green', color: 'bg-black border-green-500' },
  { name: 'light-green', color: 'bg-white border-green-500' },
];

export default function Topbar() {
  const t = useTranslations('Topbar');
  const tTx = useTranslations('Transactions');
  const { setTheme } = useTheme();
  const { transactions, addTransactions } = useTransactions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalButtons, setModalButtons] = useState<ModalConfigButton[]>([]);

  const openConfirmationModal = (title: string, message: string, buttons: ModalConfigButton[]) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalButtons(buttons);
    setShowConfirmModal(true);
  };

  const resolveConfirm = (value: boolean) => {
    const resolver = confirmResolverRef.current;
    if (resolver) {
      confirmResolverRef.current = null;
      resolver(value);
    }
  };

  const findSimilarByBaseCategory = (tx: Transaction, pool: Transaction[]) => {
    return pool.filter(candidate =>
      candidate.baseCategory === tx.baseCategory &&
      candidate.description === tx.description &&
      (candidate.amount < 0) === (tx.amount < 0)
    );
  };

  const collectCategories = (txs: Transaction[]) => {
    const unique = new Set<string>();
    txs.forEach(tx => tx.categories?.forEach(cat => unique.add(cat)));
    return Array.from(unique).filter(Boolean);
  };

  const haveSameCategories = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    const setA = new Set(a);
    return b.every(cat => setA.has(cat));
  };

  const confirmApplySimilarCategories = (
    description: string,
    baseCategory: string,
    isDebit: boolean,
    similarCount: number,
    importCount: number,
    categories: string[]
  ) => {
    const categoriesLabel = categories.length > 0 ? categories.join(', ') : t('none');
    const typeLabel = isDebit ? t('typeDebit') : t('typeCredit');
    const message = [
      t('sectionConcernedTitle'),
      `- ${t('labelDescription')}: ${description}`,
      `- ${t('labelBaseCategory')}: ${baseCategory}`,
      `- ${t('labelType')}: ${typeLabel}`,
      `- ${t('labelCount')}: ${importCount}`,
      '',
      t('sectionSimilarTitle'),
      `- ${t('labelDescription')}: ${description}`,
      `- ${t('labelCategories')}: ${categoriesLabel}`,
      `- ${t('labelType')}: ${typeLabel}`,
      `- ${t('labelCount')}: ${similarCount}`,
      '',
      t('confirmApplySimilarQuestion'),
    ].join('\n');
    return new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve;
      openConfirmationModal(
        t('confirmApplySimilarTitle'),
        message,
        [
          { label: tTx('yes'), onClick: () => resolveConfirm(true), variant: 'primary' },
          { label: tTx('no'), onClick: () => resolveConfirm(false), variant: 'secondary' },
        ]
      );
    });
  };

  const applySimilarCategoriesOnImport = async (
    newTxs: Transaction[],
    existingTxs: Transaction[]
  ): Promise<Transaction[]> => {
    const updated = [...newTxs];
    const grouped = new Map<string, number[]>();

    const getKey = (tx: Transaction) =>
      `${tx.baseCategory}||${tx.description}||${tx.amount < 0 ? 'debit' : 'credit'}`;

    updated.forEach((tx, idx) => {
      const key = getKey(tx);
      const bucket = grouped.get(key);
      if (bucket) {
        bucket.push(idx);
      } else {
        grouped.set(key, [idx]);
      }
    });

    for (const indices of grouped.values()) {
      const representative = updated[indices[0]];
      const similar = findSimilarByBaseCategory(representative, existingTxs);
      if (similar.length === 0) continue;

      const similarCategories = collectCategories(similar);
      if (similarCategories.length === 0) continue;

      const alreadySame = indices.every(idx =>
        haveSameCategories(updated[idx].categories, similarCategories)
      );
      if (alreadySame) continue;

      const apply = await confirmApplySimilarCategories(
        representative.description,
        representative.baseCategory,
        representative.amount < 0,
        similar.length,
        indices.length,
        similarCategories
      );

      if (apply) {
        indices.forEach(idx => {
          updated[idx] = { ...updated[idx], categories: similarCategories };
        });
      }
    }

    return updated;
  };

  const handleDownload = () => {
    const data = { transactions: transactions };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.json';
    a.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    let currentTransactions = [...transactions];

    for (const file of Array.from(files)) {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const lastId = Math.max(0, ...currentTransactions.map(t => parseInt(t.id)).filter(Number.isFinite));
        const parsed = parseCsvToTransactions(content, lastId);
        const withSimilarCats = await applySimilarCategoriesOnImport(parsed, currentTransactions);
        addTransactions(withSimilarCats);
        currentTransactions = [...currentTransactions, ...withSimilarCats];
      } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(content);
          const newTxs = Array.isArray(parsed) ? parsed : parsed.transactions;
          if (Array.isArray(newTxs)) {
            const currentIds = new Set(currentTransactions.map(t => t.id));
            let lastId = Math.max(0, ...currentTransactions.map(t => parseInt(t.id)).filter(Number.isFinite));

            const normalized = newTxs.map((t) => {
              if (!currentIds.has(t.id)) {
                currentIds.add(t.id);
                return t;
              }
              lastId++;
              return {
                ...t,
                id: `${lastId}`,
              };
            });

            const withSimilarCats = await applySimilarCategoriesOnImport(normalized, currentTransactions);
            addTransactions(withSimilarCats);
            currentTransactions = [...currentTransactions, ...withSimilarCats];
          }
        } catch (err) {
          console.error('Invalid JSON file:', err);
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-between border-b px-4 shadow-sm h-12">
      {/* LANG + CURRENCY */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Globe size={20} />
          <LanguageSelector />
        </div>
        <CurrencySelector />
      </div>

      {/* THEME */}
      <div className="flex items-center gap-3">
        <PaintBucket size={20} />
        <div className="flex gap-2">
          {THEMES.map((themeOption) => (
            <button
              key={themeOption.name}
              className={`w-5 h-5 cursor-pointer rounded-full border-2 ${themeOption.color}`}
              onClick={() => setTheme(themeOption.name)}
              aria-label={t('theme', { name: themeOption.name })}
            />
          ))}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleDownload}
          className="p-1 cursor-pointer hover:text-(--color-secondary) transition"
          title={t('export')}
        >
          <Download size={20} />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-1 cursor-pointer hover:text-(--color-secondary) transition"
          title={t('import')}
        >
          <HardDriveUpload size={20} />
        </button>

        <input
          type="file"
          accept=".csv,.json"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={modalTitle}
        message={modalMessage}
        buttons={modalButtons}
      />
    </div>
  );
}
