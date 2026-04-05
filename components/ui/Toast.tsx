'use client'

import { useEffect, useState } from 'react'

type ToastType = 'error' | 'info'

let toastListener: ((msg: string, type: ToastType) => void) | null = null

export function showToast(message: string, type: ToastType = 'error') {
  toastListener?.(message, type)
}

export function ToastProvider() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  useEffect(() => {
    toastListener = (message, type) => {
      setToast({ message, type })
    }
    return () => { toastListener = null }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  if (!toast) return null

  const colors = toast.type === 'error'
    ? 'border-wc-crimson/50 bg-wc-crimson/90 text-white'
    : 'border-wc-blue/50 bg-wc-blue/90 text-white'

  return (
    <div className="fixed top-12 left-4 right-4 z-[100] animate-slide-up pointer-events-none">
      <div className={`rounded-xl border px-4 py-3 text-center text-sm font-medium shadow-lg ${colors}`}>
        {toast.message}
      </div>
    </div>
  )
}
