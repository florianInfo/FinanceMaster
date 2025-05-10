'use client'

import React, { useEffect, useState } from 'react'
import { CategoryOption } from '@/types/CategoryOption'
import CategoryAddComponent from './CategoryAddComponent'
import { useTranslations } from 'next-intl'
import { Transaction } from '@/types/Transaction'

interface CategoriesAddPopupProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (categoryIds: string[]) => void
  categories: CategoryOption[],
  transaction: Transaction
  disabled?: boolean,
}

export default function CategoriesAddPopup({
  isOpen,
  onClose,
  onAdd,
  categories,
  transaction,
  disabled = false,
}: CategoriesAddPopupProps) {
  const t = useTranslations('CategoryAddPopup')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-4 rounded-xl shadow-xl w-full max-w-md relative">
        <h2 className="text-xl font-semibold text-black">{t('title')}</h2>
        <p className="text-gray-600">{t('message', {date: new Date(transaction?.date).toLocaleDateString(), description: transaction?.description})}</p>
        <CategoryAddComponent
          categories={categories}
          onAddCategory={(categoriesId) => {
            onAdd(categoriesId)
          }}
          disabled={disabled}
          refreshOnApply={false}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl cursor-pointer bg-gray-300 hover:bg-gray-400 text-black transition"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
