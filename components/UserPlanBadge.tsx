import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Crown, User, Shield } from 'lucide-react'
import { useUserPlan } from '@/hooks/useUserPlan'

export function UserPlanBadge() {
  const { role, loading } = useUserPlan()

  if (loading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        Carregando...
      </Badge>
    )
  }

  if (role === 'ADMIN') {
    return (
      <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    )
  }

  if (role === 'PREMIUM') {
    return (
      <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
        <Crown className="w-3 h-3 mr-1" />
        Premium
      </Badge>
    )
  }

  return (
    <Badge variant="secondary">
      <User className="w-3 h-3 mr-1" />
      Gratuito
    </Badge>
  )
}

export function UserPlanStatus() {
  const { userInfo, role, isPremium, isAdmin, loading } = useUserPlan()

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Plano:</span>
      <UserPlanBadge />
      {(isPremium || isAdmin) && (
        <span className="text-xs text-gray-500">
          (Acesso total às funcionalidades)
        </span>
      )}
    </div>
  )
}
