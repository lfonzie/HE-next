"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Crown, Star, ArrowLeft } from 'lucide-react'
import { useUserPlan } from '@/hooks/useUserPlan'

export default function UpgradePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { plan, isPremium } = useUserPlan()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    if (isPremium) {
      alert('Você já possui o plano Premium!')
      return
    }

    setIsLoading(true)
    try {
      // Aqui seria integrada a API de pagamento (Stripe, PagSeguro, etc.)
      // Por enquanto, faz o upgrade direto para demonstração
      const response = await fetch('/api/auth/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'PREMIUM' })
      })

      if (response.ok) {
        alert('Upgrade realizado com sucesso! Bem-vindo ao plano Premium!')
        router.push('/dashboard')
      } else {
        const data = await response.json()
        alert(`Erro no upgrade: ${data.error}`)
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Erro ao processar upgrade. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  // Se já é premium, redirecionar para dashboard
  if (isPremium) {
    router.push('/dashboard')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Você já possui plano Premium. Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Upgrade para Premium
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Desbloqueie todo o potencial do HubEdu.ia
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Plano Gratuito */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Plano Gratuito
              </CardTitle>
              <div className="text-3xl font-bold text-gray-600 mt-4">
                R$ 0/mês
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Simulador ENEM completo</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Correção automática de redações</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400">Aulas geradas por IA</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400">Chat Professor IA</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400">Suporte prioritário</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plano Premium */}
          <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                <Crown className="w-4 h-4" />
                RECOMENDADO
              </span>
            </div>
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Plano Premium
              </CardTitle>
              <div className="text-3xl font-bold text-yellow-600 mt-4">
                R$ 29,90/mês
              </div>
              <p className="text-sm text-gray-600 mt-2">
                ou R$ 299/ano (economia de 2 meses)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span><strong>Tudo do plano gratuito</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span><strong>Aulas completas geradas por IA</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span><strong>Chat Professor IA ilimitado</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span><strong>Suporte prioritário</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span><strong>Relatórios avançados</strong></span>
                </div>
              </div>

              <Button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3"
              >
                {isLoading ? 'Processando...' : 'Fazer Upgrade'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Por que escolher o Premium?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🎓</div>
                <h4 className="font-bold text-lg mb-2">Aulas Sob Medida</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Aulas completas geradas em segundos sobre qualquer tema
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">👩‍🏫</div>
                <h4 className="font-bold text-lg mb-2">Professor IA 24/7</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Tire dúvidas pedagógicas a qualquer hora
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <h4 className="font-bold text-lg mb-2">Analytics Avançados</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Relatórios detalhados de progresso e performance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
