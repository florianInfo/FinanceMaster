'use client'

import React, { useMemo, useState, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table'
import {
  ChevronRight,
  ChevronLeft,
  ChevronFirst,
  ChevronLast,
  Trash2,
  Plus
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTransactions } from '@/contexts/TransactionsContext'
import type { Transaction } from '@/types/Transaction'
import type { CategoryOption } from '@/types/CategoryOption'
import { CategoryTag } from './CategoryTag'
import Amount from './Amount'
import ColoredAmount from './ColoredAmount'
import '@/styles/globals.css'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

interface Props {
  data: Transaction[]
  setData: (newData: Transaction[]) => void
  onSelectionChange?: (selectedIds: string[]) => void
  onDeleteSelected?: (ids: string[]) => void
  onRemoveCategory?: (txSelectedIds: string[], txId: string, categoryId: string) => void
  onAddCategoriesClick?: (id: string) => void
}

export default function TransactionTable({
  data,
  setData,
  onSelectionChange,
  onDeleteSelected,
  onRemoveCategory,
  onAddCategoriesClick
}: Props) {
  const { categories: allCategories } = useTransactions()
  const t = useTranslations('TransactionTable')

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pageSize, setPageSize] = useState(20)
  const [pageIndex, setPageIndex] = useState(0)
  const [sorting, setSorting] = useState<SortingState>([])

  useEffect(() => {
    onSelectionChange?.(Array.from(selectedIds))
  }, [selectedIds])

  useEffect(() => {
    const maxPage = Math.floor(data.length / pageSize)
    if (pageIndex > maxPage) {
      setPageIndex(maxPage)
    }
  }, [data, pageSize])

  const toggleRowSelection = (id: string) => {
    console.log(id)
    setSelectedIds(prev => {
      const copy = new Set(prev)
      copy.has(id) ? copy.delete(id) : copy.add(id)
      return copy
    })
  }

  const toggleAllRows = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.map(tx => tx.id)))
    }
  }

  const columns = useMemo<ColumnDef<Transaction>[]>(() => [
    {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          checked={selectedIds.size === data.length && data.length > 0}
          indeterminate={selectedIds.size > 0 && selectedIds.size < data.length ? "true" : undefined}
          onChange={toggleAllRows}
        />
      ),
      cell: info => (
        <input
          type="checkbox"
          checked={selectedIds.has(info.row.original.id)}
          onChange={() => toggleRowSelection(info.row.original.id)}
        />
      ),
    },
    {
      header: t('date'),
      accessorKey: 'date',
      cell: info => dayjs.utc(info.getValue<string>()).format("YYYY-MM-DD"),
    },
    {
      header: t('description'),
      accessorKey: 'description',
      cell: info => (
        <input
          className="w-full bg-transparent text-lg"
          defaultValue={info.getValue<string>()}
          onBlur={e => {
            const newValue = e.target.value
            const rowIndex = info.row.index
            const updated = [...data]
            updated[rowIndex] = { ...updated[rowIndex], description: newValue }
            setData(updated)
          }}
        />
      ),
    },
    {
      id: 'categories',
      header: t('categories'),
      accessorFn: row => row.categories,
      cell: info => {
        const tx = info.row.original;
        const opts: CategoryOption[] = tx.categories
          .map(txCat => allCategories.find(catOpt => catOpt.value === txCat))
          .filter((c): c is CategoryOption => !!c);
    
        return (
          <div className="flex flex-wrap items-center gap-1 w-80">
            {opts.map(cat => (
              <CategoryTag
                key={cat.value}
                category={cat}
                onRemove={() => onRemoveCategory?.(Array.from(selectedIds), tx.id, cat.value)}
              />
            ))}
            <button
              onClick={() => onAddCategoriesClick?.(tx.id)}
              className={`cursor-pointer text-(--color-text) hover:text-(--color-secondary)`}
              title={t('addCategories')}
            >
              <Plus size={14} />
            </button>
          </div>
        );
      },
    },
    {
      header: t('amount'),
      accessorKey: 'amount',
      cell: info => <ColoredAmount amount={info.getValue<number>()} />,
    },
    {
      id: 'actions',
      header: () => (
        <div className="flex justify-end">
          <button
            disabled={selectedIds.size === 0}
            onClick={() => onDeleteSelected?.(Array.from(selectedIds))}
            className="cursor-pointer disabled:cursor-not-allowed text-white hover:text-(--color-secondary) disabled:text-gray-300"
            title={t('deleteSelected')}
          >
            <Trash2 size={20} />
          </button>
        </div>
      ),
      cell: info => (
        <div className="flex justify-end max-w-sm">
          <button
            onClick={() => onDeleteSelected?.([info.row.original.id])}
            className="cursor-pointer text-(--color-text) hover:text-(--color-secondary)"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ),
    },
  ], [data, selectedIds, allCategories, t])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { pagination: { pageIndex, pageSize }, sorting },
  })

  const totalPages = table.getPageCount()
  const pageRange = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(0, Math.min(pageIndex - 2, totalPages - 5))
    return start + i
  })

  const totalCredit = data.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
  const totalDebit = data.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-(--color-primary)">
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(header => (
                <th
                  key={header.id}
                  className={`cursor-pointer text-left p-2 text-xl font-medium text-white ${header.column.id === 'actions' ? 'text-right' : ''}`}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === 'asc' && ' ▲'}
                  {header.column.getIsSorted() === 'desc' && ' ▼'}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="border-t">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-2 text-lg">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-(--color-primary) border-t">
          <tr>
            <td colSpan={columns.length} className="p-2 font-semibold text-white">
              <div className="flex justify-between">
                <div>{t('totalTransactions', { count: data.length })}</div>
                <div className="flex flex-col">
                  <div className="flex justify-between gap-4">
                    <span>{t('debits')} :</span>
                    <Amount amount={totalDebit} />
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>{t('credits')} :</span>
                    <Amount amount={totalCredit} />
                  </div>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={columns.length} className="p-2">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button onClick={() => setPageIndex(0)} disabled={pageIndex === 0} className="py-1 cursor-pointer bg-transparent text-white rounded disabled:opacity-50">
                    <ChevronFirst />
                  </button>
                  <button onClick={() => setPageIndex(i => Math.max(i - 1, 0))} disabled={pageIndex === 0} className="py-1 cursor-pointer bg-transparent text-white rounded disabled:opacity-50">
                    <ChevronLeft />
                  </button>
                  {pageRange.map(n => (
                    <button
                      key={n}
                      onClick={() => setPageIndex(n)}
                      className={`px-2 cursor-pointer text-black py-1 rounded ${pageIndex === n ? 'bg-(--color-secondary) text-white' : 'bg-white'}`}
                    >
                      {n + 1}
                    </button>
                  ))}
                  <button onClick={() => setPageIndex(i => Math.min(i + 1, totalPages - 1))} disabled={pageIndex >= totalPages - 1} className="py-1 cursor-pointer bg-transparent text-white rounded disabled:opacity-50">
                    <ChevronRight />
                  </button>
                  <button onClick={() => setPageIndex(totalPages - 1)} disabled={pageIndex >= totalPages - 1} className="py-1 cursor-pointer bg-transparent text-white rounded disabled:opacity-50">
                    <ChevronLast />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span className="text-sm">{t('rowsPerPage')} :</span>
                  <input
                    type="number"
                    min={1}
                    value={pageSize}
                    onChange={e => setPageSize(Number(e.target.value))}
                    className="w-16 border rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
