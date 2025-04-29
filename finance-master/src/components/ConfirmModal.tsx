'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ModalConfigButton } from '@/types/ModalConfigButton'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  buttons: ModalConfigButton[]
}

export default function ConfirmModal({ isOpen, onClose, title, message, buttons }: ConfirmModalProps) {
  if (!isOpen) return null

  const getButtonStyle = (variant: ModalConfigButton['variant']) => {
    switch (variant) {
      case 'secondary':
        return 'bg-white hover:bg-(--color-secondary) hover:text-white text-black border'
      case 'primary':
        return 'bg-(--color-primary) hover:bg-(--color-secondary) text-white'
      case 'cancel':
      default:
        return 'bg-gray-300 hover:bg-gray-400 text-black'
    }
  }

  const handleClick = (btn: ModalConfigButton) => {
    btn.onClick()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-semibold text-black">{title}</h2>
        <p className="text-gray-600">{message}</p>

        <div className="flex justify-end gap-2 mt-6 flex-wrap">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(btn)}
              className={`${getButtonStyle(btn.variant)} px-4 py-2 rounded-xl cursor-pointer`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
