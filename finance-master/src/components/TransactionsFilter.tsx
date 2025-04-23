"use client"
import React, { useState, useEffect } from 'react';

export interface CategoryOption {
  value: string;
  label: string;
}

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
  const [filters, setFilters] = useState<TransactionFiltersValues>({
    startDate: initialValues.startDate || '',
    endDate: initialValues.endDate || '',
    categories: initialValues.categories || [],
    description: initialValues.description || '',
    minAmount: initialValues.minAmount ?? '',
    maxAmount: initialValues.maxAmount ?? '',
  });

  // Dès qu’un champ change, on notifie le parent
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: name.includes('Amount') ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setFilters((prev) => ({ ...prev, categories: selected }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white rounded-lg shadow">
      {/* Date de début */}
      <label className="flex flex-col">
        <span className="mb-1 text-sm font-medium text-gray-700">Date de début</span>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleDateChange}
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </label>

      {/* Date de fin */}
      <label className="flex flex-col">
        <span className="mb-1 text-sm font-medium text-gray-700">Date de fin</span>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleDateChange}
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </label>

      {/* Catégories */}
      <label className="flex flex-col">
        <span className="mb-1 text-sm font-medium text-gray-700">Catégories</span>
        <select
          multiple
          value={filters.categories}
          onChange={handleCategoryChange}
          className="h-32 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </label>

      {/* Description */}
      <label className="flex flex-col">
        <span className="mb-1 text-sm font-medium text-gray-700">Description</span>
        <input
          type="text"
          name="description"
          value={filters.description}
          onChange={handleInputChange}
          placeholder="Rechercher…"
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </label>

      {/* Montant min */}
      <label className="flex flex-col">
        <span className="mb-1 text-sm font-medium text-gray-700">Montant minimum</span>
        <input
          type="number"
          name="minAmount"
          value={filters.minAmount}
          onChange={handleInputChange}
          placeholder="0.00"
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </label>

      {/* Montant max */}
      <label className="flex flex-col">
        <span className="mb-1 text-sm font-medium text-gray-700">Montant maximum</span>
        <input
          type="number"
          name="maxAmount"
          value={filters.maxAmount}
          onChange={handleInputChange}
          placeholder="0.00"
          className="px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
      </label>
    </div>
  );
};

export default TransactionFilters;
