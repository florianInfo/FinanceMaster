'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const THEMES = [
  { id: 'theme-bnc-light', label: '🔴 BNC' },
  { id: 'theme-bnc-dark', label: '🔴 BNC' },
  { id: 'theme-desjardins', label: '🟢 Desjardins' },
  { id: 'theme-scotia', label: '🔵 Scotia' },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Pour éviter les erreurs de SSR
  useEffect(() => setMounted(true), [])

  console.log(theme)

  if (!mounted) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2 bg-surface px-4 py-2 rounded-xl border border-border shadow-md">
      {THEMES.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setTheme(id)}
          className={`px-3 py-1 text-sm rounded-md font-medium transition-colors text-(--color-text) cursor-pointer
            ${
              theme === id
                ? 'bg-(--color-primary)'
                : 'bg-muted text-bg hover:bg-border'
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
