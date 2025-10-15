'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login',
  fallback 
}: AuthGuardProps) {
  // Handle prerendering - return children without session checks
  if (typeof window === 'undefined') {
    return <>{children}</>
  }

  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
      return
    }

    if (requireAuth && !session) {
      router.push(redirectTo)
      return
    }

    setIsLoading(false)
  }, [session, status, requireAuth, redirectTo, router])

  if (status === 'loading' || isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600" suppressHydrationWarning>Verificando autenticação...</span>
        </div>
      </div>
    )
  }

  if (requireAuth && !session) {
    return null // Will redirect
  }

  return <>{children}</>
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  // Handle prerendering - return children without session checks
  if (typeof window === 'undefined') {
    return <>{children}</>
  }

  const { data: session } = useSession()

  // Verificar se usuário está autenticado
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Acesso Negado
          </h1>
          <p className="text-gray-600">
            Você precisa estar autenticado para acessar esta área.
          </p>
        </div>
      </div>
    )
  }

  // Verificar se usuário tem role ADMIN
  if (session.user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Acesso Negado
          </h1>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta área.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  // Durante loading ou SSR, mostrar loading
  if (status === 'loading' || typeof window === 'undefined') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Verificando permissões...</span>
        </div>
      </div>
    )
  }

  // Verificar se usuário está autenticado
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Acesso Negado
          </h1>
          <p className="text-gray-600">
            Você precisa estar autenticado para acessar esta área.
          </p>
        </div>
      </div>
    )
  }

  // Verificar se usuário tem role ADMIN
  if (session.user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Acesso Negado
          </h1>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta área.
          </p>
        </div>
      </div>
    )
  }

  // Verificar se é super admin baseado no email
  const superAdminEmail = process.env.NEXT_PUBLIC_GOOGLE_SUPERADMIN_EMAIL || 'fonseca@colegioose.com.br'
  if (session.user.email !== superAdminEmail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Acesso Restrito ao Super Admin
          </h1>
          <p className="text-gray-600">
            Apenas o super administrador pode acessar esta área.
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Super Admin:</strong> {superAdminEmail}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}