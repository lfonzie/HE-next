import React from 'react'
import { useUserPlan } from '@/hooks/useUserPlan'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Crown, ArrowRight } from 'lucide-react'

interface PlanGateProps {
  children: React.ReactNode
  requiredPlan?: 'free' | 'premium'
  feature?: string
  description?: string
  showUpgrade?: boolean
}

export function PlanGate({
  children,
  requiredPlan = 'PREMIUM',
  feature = 'Esta funcionalidade',
  description,
  showUpgrade = true
}: PlanGateProps) {
  const { role, isPremium, isAdmin, loading, userInfo } = useUserPlan()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      </div>
    )
  }

  // Se não há informação do usuário ou é FREE, permitir acesso apenas se requiredPlan for 'FREE'
  if (!userInfo || role === 'FREE') {
    if (requiredPlan === 'FREE') {
      return <>{children}</>
    }
  }

  // Se o role do usuário atende ao requisito, mostra o conteúdo
  if (requiredPlan === 'FREE' ||
      (requiredPlan === 'PREMIUM' && (isPremium || isAdmin)) ||
      (requiredPlan === 'ADMIN' && isAdmin)) {
    return <>{children}</>
  }

  // Se não atende, mostra mensagem de upgrade
  if (showUpgrade) {
    return (
      <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            {requiredPlan === 'premium' ? (
              <Crown className="w-6 h-6 text-yellow-600" />
            ) : (
              <Lock className="w-6 h-6 text-yellow-600" />
            )}
          </div>
          <CardTitle className="text-lg text-gray-900">
            {feature} requer plano Premium
          </CardTitle>
          {description && (
            <p className="text-sm text-gray-600 mt-2">{description}</p>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-sm text-gray-700">
            <p><strong>Seu plano atual:</strong> {plan === 'free' ? 'Gratuito' : 'Premium'}</p>
            <p className="mt-2">
              <strong>Funcionalidades do plano gratuito:</strong><br />
              • Simulador ENEM<br />
              • Correção de redações
            </p>
            <p className="mt-2">
              <strong>Funcionalidades Premium:</strong><br />
              • Aulas completas geradas por IA<br />
              • Chat Professor IA para dúvidas<br />
              • Suporte prioritário
            </p>
          </div>
          <Button
            onClick={() => window.location.href = '/upgrade'}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold"
          >
            <Crown className="w-4 h-4 mr-2" />
            Fazer Upgrade para Premium
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}

// Componente específico para funcionalidades premium
export function PremiumGate({
  children,
  feature = 'Esta funcionalidade',
  description
}: {
  children: React.ReactNode
  feature?: string
  description?: string
}) {
  return (
    <PlanGate
      requiredPlan="premium"
      feature={feature}
      description={description}
    >
      {children}
    </PlanGate>
  )
}
