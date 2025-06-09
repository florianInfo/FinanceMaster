'use client'

import { ForecastPoint } from '@/types/ForecastPoint'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'


interface Props {
  data: ForecastPoint[]
}

export default function ForecastStackedAreaChart({ data }: Props) {
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenus" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#02cf1a" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#02cf1a" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="depenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f54242" stopOpacity={0} />
              <stop offset="95%" stopColor="#f54242" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="solde" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="balance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#cf02cb" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#cf02cb" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />

          <Area
            type="monotone"
            dataKey="revenus"
            stackId="1"
            stroke="#02cf1a"
            fill="url(#revenus)"
            name="Revenus"
          />
          <Area
            type="monotone"
            dataKey="depenses"
            stackId="1"
            stroke="#f54242"
            fill="url(#depenses)"
            name="Dépenses"
          />
          <Area
            type="monotone"
            dataKey="solde"
            stroke="#3b82f6"
            fill="url(#solde)"
            name="Solde"
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#cf02cb"
            fill="url(#balance)"
            name="Balance"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
