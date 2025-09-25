"use client"

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface SessionProviderProps {
  children: React.ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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
