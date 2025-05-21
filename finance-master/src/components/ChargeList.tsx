'use client'
import { Charge } from '@/libs/ForecastHelper'
import { useTransactions } from '@/contexts/TransactionsContext'

interface Props {
  charges: Charge[]
}

export default function ChargeList({ charges }: Props) {
  const { categories } = useTransactions()

  const getCategoryColor = (cat: string) =>
    categories.find(c => c.value === cat)?.color ?? '#ccc'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {charges.map((charge, i) => {
        const isCredit = charge.type === 'credit'
        const colorClass = isCredit ? 'text-green-600' : 'text-red-600'
        const displayAmount = `${isCredit ? '+' : ''}${charge.amount.toFixed(2)} $`

        return (
          <div
            key={i}
            className="p-4 rounded-lg shadow border relative"
            style={{ borderColor: getCategoryColor(charge.category) }}
          >
            <div
              className="text-center font-semibold text-white py-1 px-3 rounded mb-2"
              style={{ backgroundColor: getCategoryColor(charge.category) }}
            >
              {charge.category}
            </div>

            <div className="text-sm italic text-center mb-1">{charge.frequency}</div>
            <div className={`text-center text-xl font-bold mb-2 ${colorClass}`}>
              {displayAmount}
            </div>

            <details className="text-sm text-muted-foreground mt-2">
              <summary className="cursor-pointer text-xs underline text-center">Valeurs</summary>
              <ul className="mt-1 max-h-32 overflow-y-auto text-center">
                {charge.transactions.map((v, i) => (
                  <li key={i}>{v.amount.toFixed(2)} {v.description} {v.date.slice(0, 10)}</li>
                ))}
              </ul>
            </details>
          </div>
        )
      })}
    </div>
  )
}
