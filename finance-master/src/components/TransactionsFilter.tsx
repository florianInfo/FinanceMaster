"use client"

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { X } from 'lucide-react';
import { CategoryOption } from '@/types/CategoryOption';
import { useTranslations } from 'next-intl';

export interface TransactionFiltersValues {
  startDate: string;
  endDate: string;
  categories: string[];
  description: string;
  minAmount: number | '';
  maxAmount: number | '';
}

interface TransactionFiltersProps {
  categories: CategoryOption[];
  initialValues?: Partial<TransactionFiltersValues>;
  onFiltersChange: (filters: TransactionFiltersValues) => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  categories,
  initialValues = {},
  onFiltersChange,
}) => {
  const t = useTranslations('TransactionFilters');
  const [filters, setFilters] = useState<TransactionFiltersValues>({
    startDate: initialValues.startDate || '',
    endDate: initialValues.endDate || '',
    categories: initialValues.categories || [],
    description: initialValues.description || '',
    minAmount: initialValues.minAmount ?? '',
    maxAmount: initialValues.maxAmount ?? '',
  });
  const [hasMounted, setHasMounted] = useState(false);
  const [selectOptions, setSelectOptions] = useState<CategoryOption[]>([]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  useEffect(() => {
    setSelectOptions(categories.map(c => ({ value: c.value, label: c.label, color: c.color })));
    const updatedSelectedCategories = categories.filter(cat => filters.categories.includes(cat.value));

    if (updatedSelectedCategories.length !== filters.categories.length) {
      handleCategorySelect(updatedSelectedCategories);
    }
  }, [categories]);

  const clearField = (name: keyof TransactionFiltersValues) => {
    setFilters(prev => ({ ...prev, [name]: '' }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name.includes('Amount')
        ? value === ''
          ? ''
          : parseFloat(value)
        : value,
    }));
  };

  const handleCategorySelect = (selected: CategoryOption[] | null) => {
    const values = selected ? selected.map(c => c.value) : [];
    setFilters(prev => ({ ...prev, categories: values }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white rounded-lg shadow">
      <label className="flex flex-col relative">
        <span className="mb-1 text-sm font-medium text-gray-700">{t('startDate')}</span>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleInputChange}
          className="px-3 py-2 w-full text-black border rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
        />
        {filters.startDate && (
          <button
            type="button"
            onClick={() => clearField('startDate')}
            className="absolute right-8 top-2/3 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </label>

      <label className="flex flex-col relative">
        <span className="mb-1 text-sm font-medium text-gray-700">{t('endDate')}</span>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleInputChange}
          className="px-3 py-2 w-full text-black border rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
        />
        {filters.endDate && (
          <button
            type="button"
            onClick={() => clearField('endDate')}
            className="absolute right-8 top-2/3 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </label>

      <label className="flex flex-col">
        <span className="mb-1 text-sm font-medium text-gray-700">{t('categories')}</span>
        {hasMounted && (
          <Select
            options={selectOptions}
            isMulti
            placeholder={t('selectPlaceholder')}
            value={selectOptions.filter(opt => filters.categories.includes(opt.value))}
            onChange={handleCategorySelect}
            className="react-select-container text-black"
            classNamePrefix="react-select"
            closeMenuOnSelect={false}
            styles={{
              control: (base, state) => ({
                ...base,
                padding: '2px',
                borderColor: state.isFocused ? 'var(--color-primary)' : 'black',
                boxShadow: state.isFocused ? '0 0 0 1px var(--color-primary)' : 'none',
                '&:hover': { borderColor: 'var(--color-primary)' },
              }),
              multiValue: (base, { data }) => ({
                ...base,
                backgroundColor: data.color || 'var(--color-primary)',
                borderRadius: '6px',
              }),
              multiValueLabel: (base, { data }) => ({
                ...base,
                color: 'white',
                fontWeight: 500,
              }),
              multiValueRemove: (base, { data }) => ({
                ...base,
                color: 'white',
                ':hover': {
                  backgroundColor: data.color || 'var(--color-primary)',
                  filter: 'brightness(0.85)',
                  color: 'white',
                },
              }),
            }}
          />
        )}
      </label>

      <label className="flex flex-col">
        <span className="mb-1 text-sm font-medium text-gray-700">{t('description')}</span>
        <input
          type="text"
          name="description"
          value={filters.description}
          onChange={handleInputChange}
          placeholder={t('searchPlaceholder')}
          className="px-3 py-2 text-black border rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
        />
      </label>

      <label className="flex flex-col relative">
        <span className="mb-1 text-sm font-medium text-gray-700">{t('minAmount')}</span>
        <input
          type="number"
          name="minAmount"
          value={filters.minAmount}
          onChange={handleInputChange}
          onWheel={e => e.preventDefault()}
          placeholder="0.00"
          className="px-3 py-2 w-full text-black border rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
        />
        {filters.minAmount !== '' && (
          <button
            type="button"
            onClick={() => clearField('minAmount')}
            className="absolute right-8 top-2/3 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </label>

      <label className="flex flex-col relative">
        <span className="mb-1 text-sm font-medium text-gray-700">{t('maxAmount')}</span>
        <input
          type="number"
          name="maxAmount"
          value={filters.maxAmount}
          onChange={handleInputChange}
          onWheel={e => e.preventDefault()}
          placeholder="0.00"
          className="px-3 py-2 w-full text-black border rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
        />
        {filters.maxAmount !== '' && (
          <button
            type="button"
            onClick={() => clearField('maxAmount')}
            className="absolute right-8 top-2/3 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </label>
    </div>
  );
};

export default TransactionFilters;