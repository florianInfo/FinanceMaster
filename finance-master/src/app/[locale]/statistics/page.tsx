'use client'

import { useTransactions } from '@/contexts/TransactionsContext'
import { useMemo } from 'react'
import BalanceChartWrapper from '@/components/analytics/BalanceChartWrapper'

export default function AnalyticsPage() {
  const { transactions } = useTransactions()

  // 🔧 Un jour : filtre basé sur périodes, tags, comptes...
  const filteredTransactions = useMemo(() => {
    return [...transactions] // placeholder : tu pourras ajouter les filtres ici
  }, [transactions])

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">📈 Analyse Financière</h1>

      {/* 🧪 Futur panneau de filtres */}
      {/* <FilterPanel onChange={...} /> */}

      {/* 🧠 Wrapper du graphe avec toute la logique */}
      <BalanceChartWrapper transactions={filteredTransactions} />
    </main>
  )
}
