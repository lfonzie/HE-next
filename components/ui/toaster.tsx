'use client'

import { AlertCircle, CheckCircle, X } from 'lucide-react'

import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-2"
      role="status"
      aria-live="polite"
    >
      {toasts.map(toast => {
        const isDestructive = toast.variant === 'destructive'

        return (
          <div
            key={toast.id}
            className={cn(
              'flex max-w-sm items-center gap-3 rounded-lg border p-4 shadow-lg',
              isDestructive
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-gray-200 bg-white text-gray-900'
            )}
          >
            <div className="flex-shrink-0" aria-hidden="true">
              {isDestructive ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              {toast.title ? (
                <p className="text-sm font-medium">{toast.title}</p>
              ) : null}
              {toast.description ? (
                <p className="mt-1 text-sm opacity-90">{toast.description}</p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}