'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useMemo } from 'react'

type GraphView = 'day' | 'month' | 'year'

interface Dataset {
  id: string
  label: string
  color: string
  visible: boolean
  data: number[]
}

interface Props {
  data: {
    labels: string[] // ex: ["01 Jan", "02 Jan", ...] ou ["Jan", "Feb", ...]
    datasets: Dataset[]
  }
  view: GraphView
  onViewChange: (v: GraphView) => void
}

export default function BalanceChartDisplay({ data, view, onViewChange }: Props) {
  const chartData = useMemo(() => {
    return data.labels.map((label, i) => {
      const point: Record<string, string | number> = { label }
      data.datasets.forEach((ds) => {
        if (ds.visible) {
          point[ds.id] = ds.data[i]
        }
      })
      return point
    })
  }, [data])

  return (
    <div className="w-full">
      {/* View Switch */}
      <div className="mb-4 flex gap-2">
        {(['day', 'month', 'year'] as GraphView[]).map(v => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`px-3 py-1 rounded text-sm border ${
              view === v ? 'bg-blue-600 text-white' : 'text-gray-700'
            }`}
          >
            {v === 'day' ? 'Jour' : v === 'month' ? 'Mois' : 'Année'}
          </button>
        ))}
      </div>

      {/* Graph */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[700px] h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip
                contentStyle={{ fontSize: '0.75rem' }}
                formatter={(value: any) => `${value.toFixed(2)} $`}
              />
              {data.datasets.map(ds =>
                ds.visible ? (
                  <Line
                    key={ds.id}
                    type="monotone"
                    dataKey={ds.id}
                    name={ds.label}
                    stroke={ds.color}
                    dot={false}
                    strokeWidth={2}
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
