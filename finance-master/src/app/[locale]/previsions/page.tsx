'use client'

import { useEffect, useState } from 'react'
import ChargeList from '@/components/ChargeList'
import { useTransactions } from '@/contexts/TransactionsContext'
import { Charge, detectRecurringCharges, generateForecastTimeline } from '@/libs/ForecastHelper'
import { ForecastPoint } from '@/types/ForecastPoint'
import ForecastStackedAreaChart from '@/components/forecast/ForecastStackedAreaChart'

export default function PrevisionsPage() {
  const { transactions } = useTransactions()

  const [startDate, setStartDate] = useState('2023-01-01')
  const [observationMonths, setObservationYears] = useState(12)
  const [forecastStart, setForecastStart] = useState('2025-06-01')
  const [forecastEnd, setForecastEnd] = useState('2026-12-31')

  const [charges, setCharges] = useState<Charge[]>([])
  const [forecast, setForecast] = useState<ForecastPoint[]>([])

  useEffect(() => {
    const newCharges = detectRecurringCharges(transactions, startDate, observationMonths)
    setCharges(newCharges.sort((a, b) => a.amount - b.amount))

    const newForecast = generateForecastTimeline(
      newCharges,
      forecastStart,
      forecastEnd,
      0
    )
    setForecast(newForecast)
  }, [transactions, startDate, observationMonths, forecastStart, forecastEnd])

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Prévision – Admin Développement</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Observation Years</label>
          <input
            type="number"
            value={observationMonths}
            onChange={e => setObservationYears(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded px-2 py-1"
            min={1}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Forecast Start</label>
          <input
            type="date"
            value={forecastStart}
            onChange={e => setForecastStart(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Forecast End</label>
          <input
            type="date"
            value={forecastEnd}
            onChange={e => setForecastEnd(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </div>
      </div>

      <ForecastStackedAreaChart data={forecast} />

      <ChargeList charges={charges} />
    </main>
  )
}
