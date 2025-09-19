'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface SessionGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function SessionGuard({ 
  children, 
  fallback,
  redirectTo = '/login'
}: SessionGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      setIsChecking(true)
      return
    }

    if (status === 'unauthenticated') {
      console.warn('SessionGuard: User not authenticated, redirecting to login')
      router.push(redirectTo)
      return
    }

    if (status === 'authenticated' && session) {
      console.log('SessionGuard: User authenticated successfully')
      setIsChecking(false)
    }
  }, [session, status, router, redirectTo])

  if (status === 'loading' || isChecking) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Checking authentication...</span>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect
  }

  return <>{children}</>
}

