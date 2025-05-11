'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Transaction } from '@/types/Transaction'
import type { CategoryOption } from '@/types/CategoryOption'

interface TransactionsContextType {
  transactions: Transaction[]
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
  addTransactions: (txs: Transaction[]) => void
  categories: CategoryOption[]
  revenueCategory: string
  setRevenueCategory: (val: string) => void
  initialBalance: number
  setInitialBalance: (val: number) => void
}

const LS_TX_KEY = 'finance-transactions'
const LS_CAT_COLOR_KEY = 'finance-category-colors'
const LS_REVENUE_CAT_KEY = 'finance-revenue-category'
const LS_INITIAL_BALANCE_KEY = 'finance-initial-balance'

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined)

export const TransactionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [catColors, setCatColors] = useState<Record<string, string>>({})
  const [revenueCategory, setRevenueCategoryState] = useState<string>('revenu')
  const [initialBalance, setInitialBalanceState] = useState<number>(0)
  const [isHydrated, setIsHydrated] = useState(false)

  // 🧩 Hydratation des préférences
  useEffect(() => {
    const storedTx = localStorage.getItem(LS_TX_KEY)
    if (storedTx) setTransactions(JSON.parse(storedTx))

    const storedColors = localStorage.getItem(LS_CAT_COLOR_KEY)
    if (storedColors) setCatColors(JSON.parse(storedColors))

    const storedRevCat = localStorage.getItem(LS_REVENUE_CAT_KEY)
    if (storedRevCat) setRevenueCategoryState(storedRevCat)

    const storedInitBal = localStorage.getItem(LS_INITIAL_BALANCE_KEY)
    if (storedInitBal) setInitialBalanceState(parseFloat(storedInitBal))

    setIsHydrated(true)
  }, [])

  // 💾 Sync localStorage
  useEffect(() => {
    if (!isHydrated) return
    localStorage.setItem(LS_TX_KEY, JSON.stringify(transactions))

    const uniqueCats = new Set<string>()
    transactions.forEach(tx => tx.categories?.forEach(cat => uniqueCats.add(cat)))

    const colorsMap = { ...catColors }
    let changed = false
    Array.from(uniqueCats).forEach(cat => {
      if (!colorsMap[cat]) {
        const newColor = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')
        colorsMap[cat] = newColor
        changed = true
      }
    })

    if (changed) {
      setCatColors(colorsMap)
      localStorage.setItem(LS_CAT_COLOR_KEY, JSON.stringify(colorsMap))
    }

    const opts: CategoryOption[] = Array.from(uniqueCats).map(cat => ({
      value: cat,
      label: cat,
      color: colorsMap[cat],
    }))
    setCategories(opts)
  }, [transactions, catColors, isHydrated])

  // 💾 Sync préférences
  const setRevenueCategory = (val: string) => {
    setRevenueCategoryState(val)
    localStorage.setItem(LS_REVENUE_CAT_KEY, val)
  }

  const setInitialBalance = (val: number) => {
    setInitialBalanceState(val)
    localStorage.setItem(LS_INITIAL_BALANCE_KEY, val.toString())
  }

  const addTransactions = (newTxs: Transaction[]) => {
    setTransactions(prev => [...prev, ...newTxs])
  }

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        setTransactions,
        addTransactions,
        categories,
        revenueCategory,
        setRevenueCategory,
        initialBalance,
        setInitialBalance,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  )
}

export const useTransactions = () => {
  const ctx = useContext(TransactionsContext)
  if (!ctx) throw new Error('useTransactions must be used within TransactionsProvider')
  return ctx
}
