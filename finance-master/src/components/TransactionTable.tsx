'use client'

import React, { useMemo, useState, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useTransactions } from '@/contexts/TransactionsContext'
import type { Transaction } from '@/types/Transaction'
import type { CategoryOption } from '@/types/CategoryOption'
import { CategoryTag } from './CategoryTag'
import Amount from './Amount'
import ColoredAmount from './ColoredAmount'
import '@/styles/globals.css'

interface Props {
  data: Transaction[]
  setData: (newData: Transaction[]) => void
  onSelectionChange?: (selectedIds: string[]) => void
}

export default function TransactionTable({ data, setData, onSelectionChange }: Props) {
  const { currency } = useCurrency()
  const { categories: allCategories } = useTransactions()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pageSize, setPageSize] = useState(20)
  const [pageIndex, setPageIndex] = useState(0)

  useEffect(() => {
    onSelectionChange?.(Array.from(selectedIds))
  }, [selectedIds, onSelectionChange])

  const toggleRowSelection = (id: string) => {
    setSelectedIds(prev => {
      const copy = new Set(prev)
      copy.has(id) ? copy.delete(id) : copy.add(id)
      return copy
    })
  }

  // supprime une catégorie d'une transaction et met à jour le state
  const handleRemoveCategory = (txId: string, catValue: string) => {
    /*setData(prev =>
      prev.map(tx =>
        tx.id === txId
          ? {
              ...tx,
              categories: tx.categories.filter(v => v !== catValue),
            }
          : tx,
      ),
    )*/
  }

  const columns = useMemo<ColumnDef<Transaction>[]>(() => [
    {
      id: 'select',
      header: () => <input type="checkbox" disabled />,
      cell: info => (
        <input
          type="checkbox"
          checked={selectedIds.has(info.row.original.id)}
          onChange={() => toggleRowSelection(info.row.original.id)}
        />
      ),
    },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: info => new Date(info.getValue<string>()).toLocaleDateString(),
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: info => (
        <input
          className="w-full bg-transparent"
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
      header: 'Catégories',
      accessorFn: row => row.categories, // on garde les valeurs string[]
      cell: info => {
        const tx = info.row.original
        // récupère les CategoryOption correspondantes
        const opts: CategoryOption[] = tx.categories
          .map(txCat => allCategories.find(catOpt => catOpt.value === txCat))
          .filter((c): c is CategoryOption => !!c)

        return (
          <div className="flex flex-wrap">
            {opts.map(cat => (
              <CategoryTag
                key={cat.value}
                category={cat}
                onRemove={() => handleRemoveCategory(tx.id, cat.value)}
              />
            ))}
          </div>
        )
      },
    },
    {
      header: 'Montant',
      accessorKey: 'amount',
      cell: info => <ColoredAmount amount={info.getValue<number>()} />,
    },
  ], [data, selectedIds, allCategories])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination: { pageIndex, pageSize } },
  })

  const totalPages = table.getPageCount()
  const pageRange = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(0, Math.min(pageIndex - 2, totalPages - 5))
    return start + i
  })

  const totalCredit = data.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
  const totalDebit  = data.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-(--color-primary)">
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(header => (
                <th key={header.id} className="text-left text-white p-2 font-medium">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="border-t">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-2">
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
                <div>Total : {data.length} transactions</div>
                <div className="flex flex-col">
                  <div>Débits : <Amount amount={totalDebit} /></div>
                  <div>Crédits : <Amount amount={totalCredit} /></div>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={columns.length} className="p-2">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setPageIndex(i => Math.max(i - 1, 0))}
                    disabled={pageIndex === 0}
                    className="px-2 py-1 bg-transparent text-white rounded disabled:opacity-50"
                  >
                    <ChevronLeft />
                  </button>
                  {pageRange.map(n => (
                    <button
                      key={n}
                      onClick={() => setPageIndex(n)}
                      className={`px-2 cursor-pointer text-black py-1 rounded ${
                        pageIndex === n
                          ? 'bg-(--color-secondary) text-white'
                          : 'bg-white'
                      }`}
                    >
                      {n + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPageIndex(i => Math.min(i + 1, totalPages - 1))}
                    disabled={pageIndex >= totalPages - 1}
                    className="px-2 py-1 bg-transparent text-white rounded disabled:opacity-50"
                  >
                    <ChevronRight/>
                  </button>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span className="text-sm">Lignes/page :</span>
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
