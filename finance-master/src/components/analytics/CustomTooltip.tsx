import { TooltipProps } from 'recharts'
import { useCurrency } from '@/contexts/CurrencyContext'
import Amount from '../Amount';

export const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (!active || !payload || payload.length === 0) return null
  const { currency } = useCurrency();

  return (
    <div
      className="rounded p-2 text-xs"
      style={{
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-text)',
      }}
    >
      <div className="font-bold mb-1 text-sm underline">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex justify-between gap-2 mb-1">
          <span style={{ color: entry.color }}>{entry.name} :</span>
          <span style={{ color: entry.color }}><Amount amount={entry.value.toFixed(2)} /></span>
        </div>
      ))}
    </div>
  )
}
