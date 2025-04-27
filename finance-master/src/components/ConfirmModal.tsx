'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ButtonConfig {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
  buttons: ButtonConfig[]
}

export default function ConfirmModal({ isOpen, onClose, message, buttons }: ConfirmModalProps) {
  if (!isOpen) return null

  const getButtonStyle = (variant: ButtonConfig['variant']) => {
    switch (variant) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white'
      case 'primary':
        return 'bg-blue-500 hover:bg-blue-600 text-white'
      case 'secondary':
      default:
        return 'bg-gray-300 hover:bg-gray-400 text-black'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-semibold">Confirmation</h2>
        <p className="text-gray-600">{message}</p>

        <div className="flex justify-end gap-2 mt-6 flex-wrap">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.onClick}
              className={`${getButtonStyle(btn.variant)} px-4 py-2 rounded-xl`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
