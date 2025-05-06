'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import CreatableSelect from 'react-select/creatable';
import { CategoryOption } from '@/types/CategoryOption';

interface CategoryAddComponentProps {
  categories: CategoryOption[];
  onAddCategory: (categoryIds: string[]) => void;
}

const CategoryAddComponent: React.FC<CategoryAddComponentProps> = ({
  categories,
  onAddCategory,
}) => {
  const t = useTranslations('CategoryAdd');
  const [selectedOptions, setSelectedOptions] = useState<CategoryOption[]>([]);
  const [options, setOptions] = useState<CategoryOption[]>([]);

  useEffect(() => {
    setOptions(categories);
  }, [categories]);

  const handleCreateOption = (inputValue: string) => {
    const newOption: CategoryOption = {
      label: inputValue,
      value: inputValue.toLowerCase().replace(/\s+/g, '-'),
      color: '#ccc',
    };
    setOptions((prev) => [...prev, newOption]);
    setSelectedOptions((prev) => [...prev, newOption]);
  };

  const handleApply = () => {
    const categoryIds = selectedOptions.map((opt) => opt.value);
    onAddCategory(categoryIds);
    setSelectedOptions([]);
  };

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded shadow mb-4">
      <div className="flex-1 mr-4">
        <CreatableSelect
          isMulti
          options={options}
          value={selectedOptions}
          onChange={(newValue) => setSelectedOptions(newValue as CategoryOption[])}
          onCreateOption={handleCreateOption}
          placeholder={t('placeholder')}
          className="react-select-container text-black"
          classNamePrefix="react-select"
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
              backgroundColor: data.color || '#ccc',
              color: '#fff',
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
      </div>
      <button
        onClick={handleApply}
        disabled={selectedOptions.length === 0}
        className={`px-4 py-2 rounded ${
          selectedOptions.length === 0
            ? 'bg-(--color-muted) text-white cursor-not-allowed'
            : 'bg-(--color-primary) text-white cursor-pointer hover:bg-(--color-secondary)'
        }`}
      >
        {t('apply')}
      </button>
    </div>
  );
};

export default CategoryAddComponent;
