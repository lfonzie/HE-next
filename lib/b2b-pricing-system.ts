import { prisma } from '@/lib/db'

export interface B2BPricingPlan {
  id: string
  name: string
  studentLimit: number
  monthlyPrice: number
  yearlyPrice: number
  pricePerStudent: number
  features: string[]
  popular?: boolean
}

export interface SchoolSubscription {
  id: string
  schoolId: string
  planId: string
  studentCount: number
  monthlyPrice: number
  yearlyPrice: number
  billingCycle: 'monthly' | 'yearly'
  status: 'active' | 'inactive' | 'suspended'
  startDate: Date
  endDate?: Date
  autoRenew: boolean
}

export interface PricingCalculation {
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

export class B2BPricingSystem {
  // Planos B2B conforme memorando
  private static readonly PRICING_PLANS: B2BPricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      studentLimit: 150,
      monthlyPrice: 1125, // R$ 1.125/mês
      yearlyPrice: 13500, // R$ 13.500/ano (2 meses grátis)
      pricePerStudent: 7.5, // R$ 7,50/aluno/mês
      features: [
        'Até 150 alunos',
        'Módulos acadêmicos completos',
        'Módulos de comunicação básicos',
        'Suporte por email',
        'Sistema de prompts institucionais',
        'Relatórios básicos'
      ]
    },
    {
      id: 'growth',
      name: 'Growth',
      studentLimit: 500,
      monthlyPrice: 1875, // R$ 1.875/mês
      yearlyPrice: 22500, // R$ 22.500/ano (2 meses grátis)
      pricePerStudent: 3.75, // R$ 3,75/aluno/mês
      features: [
        'Até 500 alunos',
        'Todos os módulos acadêmicos',
        'Todos os módulos de comunicação',
        'Suporte prioritário',
        'Prompts institucionais personalizados',
        'Relatórios avançados',
        'Integração com ERP'
      ],
      popular: true
    },
    {
      id: 'professional',
      name: 'Professional',
      studentLimit: 800,
      monthlyPrice: 3000, // R$ 3.000/mês
      yearlyPrice: 36000, // R$ 36.000/ano (2 meses grátis)
      pricePerStudent: 3.75, // R$ 3,75/aluno/mês
      features: [
        'Até 800 alunos',
        'Todos os módulos disponíveis',
        'Suporte dedicado',
        'Prompts totalmente personalizados',
        'Analytics avançados',
        'Integração completa com sistemas',
        'Treinamento da equipe'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      studentLimit: -1, // Ilimitado
      monthlyPrice: 4500, // R$ 4.500/mês
      yearlyPrice: 54000, // R$ 54.000/ano (2 meses grátis)
      pricePerStudent: 0, // Preço fixo
      features: [
        'Alunos ilimitados',
        'Todos os módulos disponíveis',
        'Suporte dedicado',
        'Prompts totalmente personalizados',
        'Analytics avançados',
        'Integração completa com sistemas',
        'Treinamento da equipe',
        'SLA garantido'
      ]
    }
  ]

  /**
   * Obtém todos os planos de pricing
   */
  static getPricingPlans(): B2BPricingPlan[] {
    return this.PRICING_PLANS
  }

  /**
   * Calcula o melhor plano para uma escola baseado no número de alunos
   */
  static calculateBestPlan(studentCount: number): PricingCalculation[] {
    const calculations: PricingCalculation[] = []

    for (const plan of this.PRICING_PLANS) {
      // Verificar se o plano suporta o número de alunos
      if (plan.studentLimit !== -1 && studentCount > plan.studentLimit) {
        continue
      }

      const monthlyPrice = plan.monthlyPrice
      const yearlyPrice = plan.yearlyPrice
      const monthlySavings = yearlyPrice / 12 - monthlyPrice
      const yearlySavings = monthlyPrice * 12 - yearlyPrice
      const pricePerStudent = plan.studentLimit === -1 ? 0 : monthlyPrice / plan.studentLimit

      calculations.push({
        planId: plan.id,
        planName: plan.name,
        studentCount,
        monthlyPrice,
        yearlyPrice,
        monthlySavings: Math.round(monthlySavings),
        yearlySavings: Math.round(yearlySavings),
        pricePerStudent: Math.round(pricePerStudent * 100) / 100,
        recommended: this.isRecommendedPlan(plan, studentCount)
      })
    }

    // Ordenar por recomendação e depois por preço
    return calculations.sort((a, b) => {
      if (a.recommended && !b.recommended) return -1
      if (!a.recommended && b.recommended) return 1
      return a.monthlyPrice - b.monthlyPrice
    })
  }

  /**
   * Verifica se um plano é recomendado para o número de alunos
   */
  private static isRecommendedPlan(plan: B2BPricingPlan, studentCount: number): boolean {
    // Se é o plano popular, sempre recomendado
    if (plan.popular) return true

    // Se tem exatamente o limite do plano, recomendado
    if (plan.studentLimit === studentCount) return true

    // Se está próximo do limite (80-100%), recomendado
    if (plan.studentLimit !== -1) {
      const utilization = studentCount / plan.studentLimit
      if (utilization >= 0.8 && utilization <= 1.0) return true
    }

    // Se é Enterprise e tem mais de 800 alunos, recomendado
    if (plan.id === 'enterprise' && studentCount > 800) return true

    return false
  }

  /**
   * Cria uma assinatura para uma escola
   */
  static async createSchoolSubscription(
    schoolId: string,
    planId: string,
    studentCount: number,
    billingCycle: 'monthly' | 'yearly'
  ): Promise<SchoolSubscription> {
    const plan = this.PRICING_PLANS.find(p => p.id === planId)
    if (!plan) {
      throw new Error('Plano não encontrado')
    }

    // Verificar se o número de alunos é compatível
    if (plan.studentLimit !== -1 && studentCount > plan.studentLimit) {
      throw new Error(`Número de alunos (${studentCount}) excede o limite do plano ${plan.name} (${plan.studentLimit})`)
    }

    const monthlyPrice = plan.monthlyPrice
    const yearlyPrice = plan.yearlyPrice
    const price = billingCycle === 'yearly' ? yearlyPrice : monthlyPrice

    const subscription = await prisma.school_subscriptions.create({
      data: {
        school_id: schoolId,
        plan_id: planId,
        student_count: studentCount,
        monthly_price: monthlyPrice,
        yearly_price: yearlyPrice,
        billing_cycle: billingCycle,
        status: 'active',
        start_date: new Date(),
        auto_renew: true
      }
    })

    return {
      id: subscription.id,
      schoolId: subscription.school_id,
      planId: subscription.plan_id,
      studentCount: subscription.student_count,
      monthlyPrice: subscription.monthly_price,
      yearlyPrice: subscription.yearly_price,
      billingCycle: subscription.billing_cycle as 'monthly' | 'yearly',
      status: subscription.status as 'active' | 'inactive' | 'suspended',
      startDate: subscription.start_date,
      endDate: subscription.end_date || undefined,
      autoRenew: subscription.auto_renew
    }
  }

  /**
   * Obtém assinatura de uma escola
   */
  static async getSchoolSubscription(schoolId: string): Promise<SchoolSubscription | null> {
    try {
      const subscription = await prisma.school_subscriptions.findFirst({
        where: {
          school_id: schoolId,
          status: 'active'
        },
        orderBy: {
          start_date: 'desc'
        }
      })

      if (!subscription) return null

      return {
        id: subscription.id,
        schoolId: subscription.school_id,
        planId: subscription.plan_id,
        studentCount: subscription.student_count,
        monthlyPrice: subscription.monthly_price,
        yearlyPrice: subscription.yearly_price,
        billingCycle: subscription.billing_cycle as 'monthly' | 'yearly',
        status: subscription.status as 'active' | 'inactive' | 'suspended',
        startDate: subscription.start_date,
        endDate: subscription.end_date || undefined,
        autoRenew: subscription.auto_renew
      }

    } catch (error) {
      console.error('Erro ao obter assinatura da escola:', error)
      return null
    }
  }

  /**
   * Atualiza assinatura de uma escola
   */
  static async updateSchoolSubscription(
    subscriptionId: string,
    updates: Partial<SchoolSubscription>
  ): Promise<SchoolSubscription> {
    const updated = await prisma.school_subscriptions.update({
      where: { id: subscriptionId },
      data: {
        plan_id: updates.planId,
        student_count: updates.studentCount,
        monthly_price: updates.monthlyPrice,
        yearly_price: updates.yearlyPrice,
        billing_cycle: updates.billingCycle,
        status: updates.status,
        auto_renew: updates.autoRenew,
        end_date: updates.endDate
      }
    })

    return {
      id: updated.id,
      schoolId: updated.school_id,
      planId: updated.plan_id,
      studentCount: updated.student_count,
      monthlyPrice: updated.monthly_price,
      yearlyPrice: updated.yearly_price,
      billingCycle: updated.billing_cycle as 'monthly' | 'yearly',
      status: updated.status as 'active' | 'inactive' | 'suspended',
      startDate: updated.start_date,
      endDate: updated.end_date || undefined,
      autoRenew: updated.auto_renew
    }
  }

  /**
   * Cancela assinatura de uma escola
   */
  static async cancelSchoolSubscription(subscriptionId: string): Promise<void> {
    await prisma.school_subscriptions.update({
      where: { id: subscriptionId },
      data: {
        status: 'inactive',
        end_date: new Date(),
        auto_renew: false
      }
    })
  }

  /**
   * Obtém estatísticas de assinaturas
   */
  static async getSubscriptionStats(): Promise<any> {
    try {
      const totalSubscriptions = await prisma.school_subscriptions.count({
        where: { status: 'active' }
      })

      const subscriptionsByPlan = await prisma.school_subscriptions.groupBy({
        by: ['plan_id'],
        where: { status: 'active' },
        _count: { id: true },
        _sum: { student_count: true }
      })

      const totalStudents = await prisma.school_subscriptions.aggregate({
        where: { status: 'active' },
        _sum: { student_count: true }
      })

      const monthlyRevenue = await prisma.school_subscriptions.aggregate({
        where: { 
          status: 'active',
          billing_cycle: 'monthly'
        },
        _sum: { monthly_price: true }
      })

      const yearlyRevenue = await prisma.school_subscriptions.aggregate({
        where: { 
          status: 'active',
          billing_cycle: 'yearly'
        },
        _sum: { yearly_price: true }
      })

      return {
        totalSubscriptions,
        totalStudents: totalStudents._sum.student_count || 0,
        subscriptionsByPlan: subscriptionsByPlan.map(item => ({
          planId: item.plan_id,
          count: item._count.id,
          totalStudents: item._sum.student_count || 0
        })),
        monthlyRevenue: monthlyRevenue._sum.monthly_price || 0,
        yearlyRevenue: yearlyRevenue._sum.yearly_price || 0,
        totalRevenue: (monthlyRevenue._sum.monthly_price || 0) + (yearlyRevenue._sum.yearly_price || 0)
      }

    } catch (error) {
      console.error('Erro ao obter estatísticas de assinaturas:', error)
      return {
        totalSubscriptions: 0,
        totalStudents: 0,
        subscriptionsByPlan: [],
        monthlyRevenue: 0,
        yearlyRevenue: 0,
        totalRevenue: 0
      }
    }
  }

  /**
   * Calcula preço customizado para escolas grandes
   */
  static calculateCustomPricing(studentCount: number): PricingCalculation | null {
    if (studentCount <= 800) return null

    // Para escolas com mais de 800 alunos, oferecer desconto progressivo
    const basePrice = 4500 // Enterprise
    const discountPercentage = Math.min(20, Math.floor((studentCount - 800) / 100) * 2)
    const discountedPrice = basePrice * (1 - discountPercentage / 100)

    return {
      planId: 'enterprise',
      planName: 'Enterprise Custom',
      studentCount,
      monthlyPrice: Math.round(discountedPrice),
      yearlyPrice: Math.round(discountedPrice * 12 * 0.83), // 2 meses grátis
      monthlySavings: 0,
      yearlySavings: Math.round(discountedPrice * 12 * 0.17),
      pricePerStudent: Math.round((discountedPrice / studentCount) * 100) / 100,
      recommended: true
    }
  }
}
