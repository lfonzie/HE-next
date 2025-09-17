"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

type ToastVariant = 'default' | 'destructive'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant: ToastVariant
  duration: number
}

export interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (options: ToastOptions) => { id: string; dismiss: () => void }
  dismiss: (toastId: string) => void
  clear: () => void
}

const DEFAULT_TOAST_DURATION = 5000

const ToastContext = createContext<ToastContextValue | null>(null)

const createToastId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return Math.random().toString(36).slice(2, 11)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((toastId: string) => {
    setToasts(prev => prev.filter(toastItem => toastItem.id !== toastId))

    const timer = timersRef.current.get(toastId)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(toastId)
    }
  }, [])

  const toast = useCallback(
    ({ title, description, variant = 'default', duration = DEFAULT_TOAST_DURATION }: ToastOptions) => {
      const id = createToastId()
      const toastEntry: Toast = {
        id,
        title,
        description,
        variant,
        duration,
      }

      setToasts(prev => [...prev, toastEntry])

      if (Number.isFinite(duration) && duration > 0) {
        const timeoutId = setTimeout(() => dismiss(id), duration)
        timersRef.current.set(id, timeoutId)
      }

      return { id, dismiss: () => dismiss(id) }
    },
    [dismiss]
  )

  const clear = useCallback(() => {
    setToasts([])

    timersRef.current.forEach(timeoutId => clearTimeout(timeoutId))
    timersRef.current.clear()
  }, [])

  useEffect(() => {
    return () => {
      timersRef.current.forEach(timeoutId => clearTimeout(timeoutId))
      timersRef.current.clear()
    }
  }, [])

  const value = useMemo<ToastContextValue>(() => ({
    toasts,
    toast,
    dismiss,
    clear,
  }), [toasts, toast, dismiss, clear])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}