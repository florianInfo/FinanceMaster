// 🧠 Au début de BalanceChartWrapper.tsx
'use client'

import { useState, useMemo, useEffect } from 'react'
import Select from 'react-select'
import { Eye, EyeOff, X } from 'lucide-react'
import type { Transaction } from '@/types/Transaction'
import type { CategoryOption } from '@/types/CategoryOption'
import { useTransactions } from '@/contexts/TransactionsContext'
import BalanceChartDisplay from './BalanceChartDisplay'
import { computeAggregatedChartData } from '@/libs/ChartDataHelper'
import { AggregationMode, CurveConfig, GraphView } from '@/types/CurveConfig'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import '../../styles/globals.css'

interface Props {
  transactions: Transaction[]
}

export default function BalanceChartWrapper({ transactions }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const locale = useLocale()

  const {
    categories,
    revenueCategory,
    setRevenueCategory,
    initialBalance,
    setInitialBalance
  } = useTransactions()

  const revenueCatOpt = categories.find(c => c.value === revenueCategory)

  const [revenueCurveVisible, setRevenueCurveVisible] = useState(true)
  const [revenueCurve, setRevenueCurve] = useState<CurveConfig>({
    id: revenueCategory || 'revenu',
    label: revenueCatOpt?.label || revenueCategory || 'revenu',
    color: revenueCatOpt?.color || '#F59E0B', // amber-500
    visible: true,
    aggregation: 'total',
    editable: true,
  })
  useEffect(() => {
    const updated = categories.find(c => c.value === revenueCategory)
    setRevenueCurve(prev => ({
      ...prev,
      id: revenueCategory || 'revenu',
      label: updated?.label || revenueCategory || 'revenu',
      color: '#F59E0B',
    }))
  }, [revenueCategory, categories])

  const [view, setView] = useState<GraphView>('month')

  const [curves, setCurves] = useState<CurveConfig[]>(() => {
    return [
      {
        id: 'solde',
        label: 'Solde',
        color: 'var(--color-text)',
        visible: true,
        aggregation: 'min',
        editable: false,
      },
      {
        id: 'balance',
        label: 'Balance',
        color: '#22c55e',
        visible: true,
        aggregation: 'total',
        editable: false,
      },
    ]
  })

  const toggleCurveVisibility = (id: string) => {
    if (id === revenueCurve.id) {
      setRevenueCurveVisible(v => !v)
    } else {
      setCurves(prev =>
        prev.map(c =>
          c.id === id ? { ...c, visible: !c.visible } : c
        )
      )
    }
  }

  const allCurves = [...curves.slice(0, 2), revenueCurve, ...curves.slice(2)]

  const chartData = useMemo(() => {
    return computeAggregatedChartData(
      transactions,
      allCurves.map(c =>
        c.id === revenueCurve.id ? { ...revenueCurve, visible: revenueCurveVisible } : c
      ),
      view,
      revenueCategory,
      initialBalance,
      locale
    )
  }, [transactions, curves, revenueCurve, revenueCurveVisible, view, revenueCategory, initialBalance])

  return (
    <section className="flex gap-4">
       <aside className="w-58 shrink-0 space-y-2 pr-2 max-h-[400px] overflow-auto relative z-10">
        {allCurves.map(curve => (
          <div key={curve.id} className="flex items-center gap-2 border-b pb-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: curve.id === revenueCurve.id
                ? (revenueCurveVisible ? curve.color : '#d1d5db')
                : (curve.visible ? curve.color : '#d1d5db') }}
            />

            {curve.id === revenueCurve.id ? (
              <div className="flex-1">
                {mounted && <Select
                  className="text-xs mb-2"
                  options={categories}
                  value={{ value: revenueCategory, label: revenueCatOpt?.label || revenueCategory || 'revenu' }}
                  onChange={(selected) => selected && setRevenueCategory(selected.value)}
                  isSearchable
                  menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      minHeight: '1.5rem',
                      fontSize: '0.75rem',
                      padding: '2px',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      borderColor: state.isFocused ? 'var(--color-primary)' : 'var(--color-text)',
                      boxShadow: state.isFocused ? '0 0 0 1px var(--color-primary)' : 'none',
                      '&:hover': { borderColor: 'var(--color-primary)' },
                    }),
                    menuPortal: base => ({
                      ...base,
                      zIndex: 9999,
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: 'var(--color-text)',
                    }),
                    input: (base) => ({
                      ...base,
                      color: 'var(--color-text)',
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: 'var(--color-text)',
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? 'rgba(0,0,0,0.05)' : 'var(--color-bg)',
                      color: 'var(--color-text)',
                      cursor: 'pointer',
                    }),
                    indicatorsContainer: (base) => ({
                      ...base,
                      height: '1.5rem',
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      padding: '0 0.25rem',
                    }),
                    dropdownIndicator: (base) => ({
                      ...base,
                      padding: '0 0.25rem',
                      color: 'var(--color-text)',
                    }),
                  }}
                  
                />
                }</div>
            ) : curve.editable ? (
              <div className="flex-1 z-50 relative">
              {mounted && (
                <Select
                  className="text-xs"
                  options={categories.filter(cat => !curves.map(curve => curve.id).includes(cat.value))}
                  value={categories.find(opt => opt.value === curve.id) || null}
                  onChange={(selected) => {
                    if (!selected) return
                    const cat = categories.find(c => c.value === selected.value)
                    if (!cat) return
                    setCurves(prev =>
                      prev.map(c =>
                        c.id === curve.id
                          ? { ...c, id: cat.value, label: cat.label, color: cat.color }
                          : c
                      )
                    )
                  }}
                  isSearchable
                  menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                  menuPlacement="auto"
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    control: (base, state) => ({
                      ...base,
                      minHeight: '1.5rem',
                      fontSize: '0.75rem',
                      padding: '2px',
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      borderColor: state.isFocused ? 'var(--color-primary)' : 'var(--color-text)',
                      boxShadow: state.isFocused ? '0 0 0 1px var(--color-primary)' : 'none',
                      '&:hover': { borderColor: 'var(--color-primary)' },
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: 'var(--color-text)',
                    }),
                    input: (base) => ({
                      ...base,
                      color: 'var(--color-text)',
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: 'var(--color-text)',
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      zIndex: 50
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? 'rgba(0,0,0,0.05)' : 'var(--color-bg)',
                      color: 'var(--color-text)',
                      cursor: 'pointer',
                    }),
                    indicatorsContainer: (base) => ({
                      ...base,
                      height: '1.5rem',
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      padding: '0 0.25rem',
                    }),
                    dropdownIndicator: (base) => ({
                      ...base,
                      padding: '0 0.25rem',
                      color: 'var(--color-text)',
                    }),
                  }}
                />
              )}
            </div>
            ) : (
              <span className="text-xs text-(--color-text)">{curve.label}</span>
            )}

            <button
              className="text-gray-500 hover:text-(--color-text) cursor-pointer"
              onClick={() => toggleCurveVisibility(curve.id)}
            >
              {((curve.id === revenueCurve.id && revenueCurveVisible) ||
                (curve.id !== revenueCurve.id && curve.visible)) ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>

            {curve.editable && (
              <button
                className={`text-red-500 hover:text-red-700 ${curve.id == revenueCurve.id ? 'invisible': 'cursor-pointer'}`}
                onClick={() => setCurves(prev => prev.filter(c => c.id !== curve.id))}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {/* ➕ Ajouter une catégorie */}
        <div className="mt-2">
          <button
            className="w-full cursor-pointer text-xs px-2 py-1 rounded border border-dashed border-gray-400 text-(--color-text) hover:bg-(--color-secondary) hover:text-white"
            onClick={() => {
              const existingIds = new Set([...curves.map(c => c.id), revenueCurve.id])
              const next = categories.find(c => !existingIds.has(c.value))
              if (!next) return
              setCurves(prev => [
                ...prev,
                {
                  id: next.value,
                  label: next.label,
                  color: next.color,
                  visible: true,
                  aggregation: 'total',
                  editable: true,
                },
              ])
            }}
          >
            + Ajouter une catégorie
          </button>
        </div>
      </aside>

      {/* 📈 Graphe */}
      <div className="flex-1 min-w-0">
        <BalanceChartDisplay
          data={chartData}
          view={view}
          onViewChange={setView}
        />
      </div>
    </section>
  )
}
