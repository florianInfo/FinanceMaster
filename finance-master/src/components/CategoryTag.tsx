// src/components/CategoryTag.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { CategoryOption } from '@/types/CategoryOption';

interface CategoryTagProps {
  category: CategoryOption;
  onRemove: (value: string) => void;
}

export const CategoryTag: React.FC<CategoryTagProps> = ({ category, onRemove }) => {
  return (
    <span
      className="inline-flex items-center text-sm font-medium text-white rounded-full px-2 py-0.5 mr-1 mb-1"
      style={{ backgroundColor: category.color }}
    >
      {category.label}
      <button
        onClick={() => onRemove(category.value)}
        className="ml-1 focus:outline-none"
      >
        <X size={12} />
      </button>
    </span>
  );
};
