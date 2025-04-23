'use client';

import { Globe, PaintBucket, Download, HardDriveUpload } from 'lucide-react';
import { useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { parseCsvToTransactions } from '@/libs/FileUploader';
import { useTransactions } from '@/contexts/TransactionsContext';
import CurrencySelector from './CurrencySelector';
import LanguageSelector from './LanguageSelector';

const THEMES = [
  { name: 'dark-red', color: 'bg-black border-red-500' },
  { name: 'light-red', color: 'bg-white border-red-500' },
  { name: 'dark-green', color: 'bg-black border-green-500' },
  { name: 'light-green', color: 'bg-white border-green-500' },
];

export default function Topbar() {
  const [language, setLanguage] = useState('fr');
  const { theme, setTheme } = useTheme();
  const { transactions, addTransactions } = useTransactions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    const data = { transactions: transactions }; // <-- à remplacer par les vraies données
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
  
    let currentTransactions = [...transactions]; // clone en mémoire
  
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
        addTransactions(parsed);
        currentTransactions = [...currentTransactions, ...parsed]; // update pour les prochains
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
              // Sinon on génère un nouveau id
              lastId++;
              return {
                ...t,
                id: `${lastId}`,
              };
            });

            addTransactions(normalized);
            currentTransactions = [...currentTransactions, ...normalized];
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
+         <Globe size={20} />
+         <LanguageSelector />
+       </div>
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
              aria-label={`Thème ${themeOption.name}`}
            />
          ))}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleDownload}
          className="p-1 cursor-pointer hover:text-(--color-secondary) transition"
          title="Exporter en JSON"
        >
          <Download size={20} />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-1 cursor-pointer hover:text-(--color-secondary) transition"
          title="Importer un ou plusieurs fichiers CSV ou JSON"
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
    </div>
  );
}
