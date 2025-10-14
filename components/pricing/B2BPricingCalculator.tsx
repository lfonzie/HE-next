'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Check, 
  Users, 
  Star, 
  Calculator,
  TrendingUp,
  DollarSign,
  Calendar,
  Zap
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface PricingPlan {
  id: string
  name: string
  studentLimit: number
  monthlyPrice: number
  yearlyPrice: number
  pricePerStudent: number
  features: string[]
  popular?: boolean
}

interface PricingCalculation {
  planId: string
  planName: string
  studentCount: number
  monthlyPrice: number
  yearlyPrice: number
  monthlySavings: number
  yearlySavings: number
  pricePerStudent: number
  recommended: boolean
}

export default function B2BPricingCalculator() {
  const [studentCount, setStudentCount] = useState<number>(100)
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [calculations, setCalculations] = useState<PricingCalculation[]>([])
  const [customPricing, setCustomPricing] = useState<PricingCalculation | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Carregar planos
  useEffect(() => {
    loadPricingPlans()
  }, [])

  // Calcular pricing quando número de alunos muda
  useEffect(() => {
    if (studentCount > 0) {
      calculatePricing(studentCount)
    }
  }, [studentCount])

  const loadPricingPlans = async () => {
    try {
      const response = await fetch('/api/b2b-pricing?action=plans')
      const data = await response.json()
      setPlans(data.plans)
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
      toast.error('Erro ao carregar planos de pricing')
    }
  }

  const calculatePricing = async (count: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/b2b-pricing?action=calculate&studentCount=${count}`)
      const data = await response.json()
      setCalculations(data.calculations)
      setCustomPricing(data.customPricing)
    } catch (error) {
      console.error('Erro ao calcular pricing:', error)
      toast.error('Erro ao calcular pricing')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatSavings = (savings: number) => {
    return savings > 0 ? `Economia de ${formatPrice(savings)}` : ''
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Pricing B2B HubEdu.ia
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Escolha o plano ideal para sua escola. Preços baseados no número de alunos com desconto anual.
        </p>
      </div>

      {/* Calculadora */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora de Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentCount">Número de Alunos</Label>
            <Input
              id="studentCount"
              type="number"
              value={studentCount}
              onChange={(e) => setStudentCount(parseInt(e.target.value) || 0)}
              placeholder="Digite o número de alunos"
              min="1"
              max="10000"
            />
          </div>
          
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      {calculations.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">
            Planos Recomendados para {studentCount} alunos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calculations.map((calc, index) => (
              <motion.div
                key={calc.planId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative ${calc.recommended ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
                  {calc.recommended && (
                    <Badge className="absolute -top-2 -right-2 bg-blue-500">
                      <Star className="h-3 w-3 mr-1" />
                      Recomendado
                    </Badge>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {calc.planName}
                      <Users className="h-5 w-5 text-gray-500" />
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {formatPrice(calc.monthlyPrice)}
                      </div>
                      <div className="text-sm text-gray-500">/mês</div>
                      {calc.pricePerStudent > 0 && (
                        <div className="text-xs text-gray-400">
                          {formatPrice(calc.pricePerStudent)}/aluno
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Anual:</span>
                        <span className="font-semibold">{formatPrice(calc.yearlyPrice)}</span>
                      </div>
                      {calc.yearlySavings > 0 && (
                        <div className="text-xs text-green-600">
                          {formatSavings(calc.yearlySavings)}/ano
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full" 
                      variant={calc.recommended ? "default" : "outline"}
                    >
                      Escolher Plano
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pricing Customizado */}
          {customPricing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700">
                    <Zap className="h-5 w-5" />
                    {customPricing.planName}
                    <Badge className="bg-purple-500">Desconto Especial</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600">
                      {formatPrice(customPricing.monthlyPrice)}
                    </div>
                    <div className="text-sm text-gray-500">/mês</div>
                    <div className="text-xs text-gray-400">
                      {formatPrice(customPricing.pricePerStudent)}/aluno
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Anual:</span>
                      <span className="font-semibold">{formatPrice(customPricing.yearlyPrice)}</span>
                    </div>
                    <div className="text-sm text-green-600">
                      {formatSavings(customPricing.yearlySavings)}/ano
                    </div>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Solicitar Proposta Personalizada
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      {/* Comparação de Planos */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Recursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Recurso</th>
                  {plans.map(plan => (
                    <th key={plan.id} className="text-center p-2">
                      {plan.name}
                      {plan.popular && <Star className="h-4 w-4 text-yellow-500 mx-auto" />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Alunos</td>
                  {plans.map(plan => (
                    <td key={plan.id} className="text-center p-2">
                      {plan.studentLimit === -1 ? 'Ilimitado' : `Até ${plan.studentLimit}`}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Preço Mensal</td>
                  {plans.map(plan => (
                    <td key={plan.id} className="text-center p-2 font-semibold">
                      {formatPrice(plan.monthlyPrice)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Preço Anual</td>
                  {plans.map(plan => (
                    <td key={plan.id} className="text-center p-2 font-semibold text-green-600">
                      {formatPrice(plan.yearlyPrice)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Suporte</td>
                  {plans.map(plan => (
                    <td key={plan.id} className="text-center p-2">
                      {plan.id === 'starter' ? 'Email' : 
                       plan.id === 'growth' ? 'Prioritário' : 'Dedicado'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
