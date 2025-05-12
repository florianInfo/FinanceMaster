import { getRequestConfig } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import type { Transaction } from '@/types/Transaction'
import type { CurveConfig, GraphView } from '@/types/CurveConfig'

export interface Dataset {
  id: string
  label: string
  color: string
  visible: boolean
  data: number[]
}

export interface ChartData {
  labels: string[]
  datasets: Dataset[]
}

export function computeAggregatedChartData(
  transactions: Transaction[],
  curves: CurveConfig[],
  view: GraphView,
  revenueCategory: string,
  initialBalance: number,
  locale: string
): ChartData {
  if (transactions.length === 0) return { labels: [], datasets: [] }

  const sorted = [...transactions].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const monthYearFormatter = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' })

  const points: Map<string, {
    label: string
    date: Date
    solde: number
    revenue: number
    expense: number
    balance: number
    categories: Record<string, number>
  }> = new Map()

  let runningSolde = initialBalance ?? 0

  for (const tx of sorted) {
    const date = new Date(tx.date)
    const dayKey = date.toISOString().slice(0, 10)

    const isRevenue = tx.categories.includes(revenueCategory)
    const amount = tx.amount

    runningSolde += amount

    const key =
      view === 'year'
        ? date.getFullYear().toString()
        : view === 'month'
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : dayKey

    const label =
      view === 'year'
        ? date.getFullYear().toString()
        : view === 'month'
        ? monthYearFormatter.format(date)
        : dayKey

    if (!points.has(key)) {
      points.set(key, {
        label,
        date,
        solde: runningSolde,
        revenue: 0,
        expense: 0,
        balance: 0,
        categories: {},
      })
    }

    const p = points.get(key)!
    if (isRevenue) {
      p.revenue += amount
    } else {
      p.expense += amount
    }
    p.balance = p.revenue + p.expense

    for (const cat of tx.categories) {
      p.categories[cat] = (p.categories[cat] || 0) + Math.abs(amount)
    }

    p.solde = runningSolde
  }

  const grouped = new Map<string, typeof points>()

  for (const [key, point] of points.entries()) {
    const groupKey = key
    if (!grouped.has(groupKey)) grouped.set(groupKey, new Map())
    grouped.get(groupKey)!.set(key, point)
  }

  const labels: string[] = []
  const datasetMap: Record<string, number[]> = {}

  for (const curve of curves) {
    if (curve.visible) datasetMap[curve.id] = []
  }

  for (const [groupKey, map] of grouped.entries()) {
    const values = [...map.values()]
    labels.push(values[0].label)

    for (const curve of curves) {
      if (!curve.visible) continue

      let val = 0
      switch (curve.id) {
        case 'solde':
          const allS = values.map(v => v.solde)
          val = Math.min(...allS)
          break
        case 'balance':
          val = values.reduce((acc, v) => acc + v.balance, 0)
          break
        default:
          if (curve.id === revenueCategory) {
            val = values.reduce((acc, v) => acc + v.revenue, 0)
          } else {
            val = values.reduce((acc, v) => acc + (v.categories[curve.id] ?? 0), 0)
          }
          break
      }

      datasetMap[curve.id].push(val)
    }
  }

  return {
    labels,
    datasets: curves
      .filter(c => c.visible)
      .map(c => ({
        id: c.id,
        label: c.label,
        color: c.color,
        visible: true,
        data: datasetMap[c.id],
      })),
  }
}
