'use client'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Transaction } from '../types/Transaction';
import { useCurrency } from '../contexts/CurrencyContext';
import '../globals.css'

interface Props {
  data: Transaction[];
  setData: (newData: Transaction[]) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export default function TransactionTable({ data, setData, onSelectionChange }: Props) {
  const {currency} = useCurrency();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState(20);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedIds));
    }
  }, [selectedIds, onSelectionChange]);

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const columns = useMemo<ColumnDef<Transaction>[]>(() => [
    {
      id: 'select',
      header: () => <input type="checkbox" disabled />, // header checkbox à connecter plus tard
      cell: (info) => (
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
      cell: (info) => new Date(info.getValue<string>()).toLocaleDateString(),
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (info) => (
        <input
          className="w-full bg-transparent"
          defaultValue={info.getValue<string>()}
          onBlur={(e) => {
            const newValue = e.target.value;
            const rowIndex = info.row.index;
            const updated = [...data];
            updated[rowIndex] = {
              ...updated[rowIndex],
              description: newValue,
            };
            setData(updated);
          }}
        />
      ),
    },
    {
      header: 'Catégories',
      accessorKey: 'categories',
      cell: (info) => info.getValue<string[]>().join(', '),
    },
    {
      header: 'Type',
      accessorKey: 'type',
    },
    {
      header: 'Montant',
      accessorKey: 'amount',
      cell: (info) => `${info.getValue<number>().toFixed(2)} ${currency}`,
    },
  ], [data, selectedIds, setData, currency]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination: { pageIndex, pageSize } },
    manualPagination: false,
  });

  const totalPages = table.getPageCount();
  const pageRange = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(0, Math.min(pageIndex - 2, totalPages - 5));
    return start + i;
  });

  const totalCredit = data.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = data.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-(--color-primary)">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
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
            <td className="p-2 font-semibold text-white" colSpan={columns.length}>
              Total : {data.length} transactions —
              Débits : {totalDebit.toFixed(2)} {currency} —
              Crédits : {totalCredit.toFixed(2)} {currency}
            </td>
          </tr>
          <tr>
            <td colSpan={columns.length} className="p-2">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={pageIndex === 0}
                    className="px-2 py-1 bg-transparent text-white rounded disabled:opacity-50"
                  >
                    <ChevronLeft/>
                  </button>
                  {pageRange.map((num) => (
                    <button
                      key={num}
                      onClick={() => setPageIndex(num)}
                      className={`px-2 cursor-pointer text-black py-1 rounded ${pageIndex === num ? 'bg-(--color-secondary) text-white' : 'bg-white'}`}
                    >
                      {num + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages - 1))}
                    disabled={pageIndex >= totalPages - 1}
                    className="px-2 py-1 cursor-pointer bg-transparent text-white rounded disabled:opacity-50"
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
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="w-16 border rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
