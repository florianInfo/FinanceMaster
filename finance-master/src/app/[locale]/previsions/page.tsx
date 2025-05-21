'use client'

import ChargeList from '@/components/ChargeList'
import { useTransactions } from '@/contexts/TransactionsContext'
import { detectRecurringCharges, generateForecastTimeline } from '@/libs/ForecastHelper'

export default function PrevisionsPage() {
  const { transactions } = useTransactions()
  const charges = detectRecurringCharges(transactions).sort((a, b) => a.amount - b.amount)

  const forecast = generateForecastTimeline([...charges], '2025-06-01', '2025-12-31', 0)
  console.log(forecast)


  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Prévision - Admin Développement</h1>
      <ChargeList charges={charges} />
    </main>
  )
}
