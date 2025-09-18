"use client"

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { useEffect } from 'react'

interface SessionProviderProps {
  children: React.ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  useEffect(() => {
    // Handle NextAuth errors globally
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('CLIENT_FETCH_ERROR') || 
          event.message?.includes('Failed to fetch')) {
        console.warn('NextAuth session fetch error, this is usually temporary:', event.message)
        // Don't show error to user for session fetch issues
        event.preventDefault()
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  return (
    <NextAuthSessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={false} // Disable refetch on window focus to reduce errors
    >
      {children}
    </NextAuthSessionProvider>
  )
}
