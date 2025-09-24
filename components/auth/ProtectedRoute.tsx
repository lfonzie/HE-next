'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const [mounted, setMounted] = useState(false)
  
  // Handle prerendering and hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // During prerendering or before hydration, return children
  if (!mounted) {
    return <>{children}</>
  }

  const { data: session, status } = useSession()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side before accessing window
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session && isClient) {
      // Redirect to login with callback URL
      const currentPath = window.location.pathname
      router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`)
    }
  }, [session, status, router, isClient])

  // During SSR and initial hydration, always render the children
  // This prevents hydration mismatch
  if (!isClient) {
    return <>{children}</>
  }

  // Show loading while checking authentication (only on client)
  if (status === 'loading') {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600" suppressHydrationWarning>Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!session) {
    return null
  }

  // User is authenticated, show the protected content
  return <>{children}</>
}
