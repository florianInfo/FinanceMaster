'use client';

import { Globe, PaintBucket, Download, HardDriveUpload } from 'lucide-react';
import { useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { parseCsvToTransactions } from '../libs/FileUploader';
import { useTransactions } from '../contexts/TransactionsContext';
import CurrencySelector from '../components/CurrencySelector';

const LANGUAGES = [
  { code: 'fr', label: 'FR', flag: '/flags/fr.svg' },
  { code: 'en', label: 'EN', flag: '/flags/en.svg' },
];

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;

        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          const lastId = Math.max(0, ...transactions.map(t => parseInt(t.id)).filter(Number.isFinite))
          console.log(lastId)
          const parsed = parseCsvToTransactions(content, lastId);
          addTransactions(parsed);
        } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
          try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
              addTransactions(parsed);
            } else if (Array.isArray(parsed.transactions)) {
              addTransactions(parsed.transactions);
            }
          } catch (err) {
            console.error('Invalid JSON file:', err);
          }
        }
      };
      reader.readAsText(file);
    });
  };

  return (
    <div className="flex items-center justify-between border-b px-4 shadow-sm h-12">
      {/* LANG + CURRENCY */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Globe size={20} />
          <select
            className="border rounded px-2 py-1 text-sm bg-(--color-bg) cursor-pointer"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
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
