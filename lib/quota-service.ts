import { prisma } from '@/lib/db'
import { Decimal } from '@prisma/client/runtime/library'
import { calculateCost } from '@/lib/model-pricing'

export interface QuotaUsage {
  provider: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  costUsd?: number
  costBrl?: number
  module?: string
  conversationId?: string
  apiEndpoint?: string
  success?: boolean
  errorMessage?: string
}

export interface QuotaCheckResult {
  allowed: boolean
  remainingTokens: number
  quotaExceeded: boolean
  dailyLimitExceeded?: boolean
  hourlyLimitExceeded?: boolean
  costLimitExceeded?: boolean
  message?: string
}

export interface QuotaStatus {
  userId: string
  month: string
  tokenLimit: number
  tokenUsed: number
  remainingTokens: number
  percentageUsed: number
  dailyUsage?: number
  hourlyUsage?: number
  costUsd?: number
  costBrl?: number
  isActive: boolean
}

export class QuotaService {
  /**
   * Verifica se o usuário pode fazer uma requisição baseado nas quotas
   */
  static async checkQuota(
    userId: string,
    usage: QuotaUsage
  ): Promise<QuotaCheckResult> {
    try {
      const currentMonth = this.getCurrentMonth()
      
      // Buscar quota do usuário para o mês atual
      let quota = await prisma.quotas.findUnique({
        where: {
          unique_user_month_quota: {
            user_id: userId,
            month: currentMonth
          }
        }
      })

      // Se não existe quota para o mês atual, criar uma
      if (!quota) {
        quota = await this.createMonthlyQuota(userId, currentMonth)
      }

      // Verificar limites diários e horários se configurados
      const settings = await prisma.quota_settings.findUnique({
        where: { role: (await this.getUserRole(userId)) as any }
      })

      // Verificar limite mensal
      if (quota.token_used + usage.totalTokens > quota.token_limit) {
        return {
          allowed: false,
          remainingTokens: quota.token_limit - quota.token_used,
          quotaExceeded: true,
          message: `Limite mensal de tokens excedido. Restam ${quota.token_limit - quota.token_used} tokens.`
        }
      }

      // Verificar limite diário se configurado
      if (settings?.daily_token_limit) {
        const dailyUsage = await this.getDailyUsage(userId, currentMonth)
        if (dailyUsage + usage.totalTokens > settings.daily_token_limit) {
          return {
            allowed: false,
            remainingTokens: quota.token_limit - quota.token_used,
            dailyLimitExceeded: true,
            message: `Limite diário de tokens excedido. Limite: ${settings.daily_token_limit} tokens/dia.`
          }
        }
      }

      // Verificar limite horário se configurado
      if (settings?.hourly_token_limit) {
        const hourlyUsage = await this.getHourlyUsage(userId)
        if (hourlyUsage + usage.totalTokens > settings.hourly_token_limit) {
          return {
            allowed: false,
            remainingTokens: quota.token_limit - quota.token_used,
            hourlyLimitExceeded: true,
            message: `Limite horário de tokens excedido. Limite: ${settings.hourly_token_limit} tokens/hora.`
          }
        }
      }

      // Verificar limite de custo se configurado
      if (settings?.cost_limit_usd && usage.costUsd) {
        const monthlyCost = await this.getMonthlyCost(userId, currentMonth)
        if (monthlyCost + usage.costUsd > settings.cost_limit_usd) {
          return {
            allowed: false,
            remainingTokens: quota.token_limit - quota.token_used,
            costLimitExceeded: true,
            message: `Limite de custo mensal excedido. Limite: $${settings.cost_limit_usd} USD.`
          }
        }
      }

      return {
        allowed: true,
        remainingTokens: quota.token_limit - quota.token_used - usage.totalTokens,
        quotaExceeded: false
      }

    } catch (error) {
      console.error('Erro ao verificar quota:', error)
      // Em caso de erro, permitir a requisição mas logar o erro
      return {
        allowed: true,
        remainingTokens: 0,
        quotaExceeded: false,
        message: 'Erro ao verificar quota - requisição permitida'
      }
    }
  }

  /**
   * Registra o uso de tokens após uma requisição
   */
  static async recordUsage(userId: string, usage: QuotaUsage): Promise<void> {
    try {
      const currentMonth = this.getCurrentMonth()
      
      // Buscar quota do usuário
      let quota = await prisma.quotas.findUnique({
        where: {
          unique_user_month_quota: {
            user_id: userId,
            month: currentMonth
          }
        }
      })

      if (!quota) {
        quota = await this.createMonthlyQuota(userId, currentMonth)
      }

      // Calcular custos usando os preços atualizados se não fornecidos
      let costUsd = usage.costUsd || 0
      let costBrl = usage.costBrl || 0
      
      if (!usage.costUsd && !usage.costBrl) {
        const calculatedCost = calculateCost(
          usage.provider,
          usage.model,
          usage.promptTokens,
          usage.completionTokens
        )
        costUsd = calculatedCost.costUsd
        costBrl = calculatedCost.costBrl
      }

      // Criar log de uso
      await prisma.quota_usage_log.create({
        data: {
          quota_id: quota.id,
          user_id: userId,
          provider: usage.provider,
          model: usage.model,
          prompt_tokens: usage.promptTokens,
          completion_tokens: usage.completionTokens,
          total_tokens: usage.totalTokens,
          cost_usd: new Decimal(costUsd),
          cost_brl: new Decimal(costBrl),
          module: usage.module,
          conversation_id: usage.conversationId,
          api_endpoint: usage.apiEndpoint,
          success: usage.success ?? true,
          error_message: usage.errorMessage
        }
      })

      // Atualizar contador de tokens usados na quota
      await prisma.quotas.update({
        where: { id: quota.id },
        data: {
          token_used: quota.token_used + usage.totalTokens,
          updated_at: new Date()
        }
      })

    } catch (error) {
      console.error('Erro ao registrar uso de quota:', error)
    }
  }

  /**
   * Obtém o status atual da quota do usuário
   */
  static async getQuotaStatus(userId: string, month?: string): Promise<QuotaStatus | null> {
    try {
      const targetMonth = month || this.getCurrentMonth()
      
      const quota = await prisma.quotas.findUnique({
        where: {
          unique_user_month_quota: {
            user_id: userId,
            month: targetMonth
          }
        }
      })

      if (!quota) {
        return null
      }

      const dailyUsage = await this.getDailyUsage(userId, targetMonth)
      const hourlyUsage = await this.getHourlyUsage(userId)
      const monthlyCost = await this.getMonthlyCost(userId, targetMonth)

      return {
        userId: quota.user_id,
        month: quota.month,
        tokenLimit: quota.token_limit,
        tokenUsed: quota.token_used,
        remainingTokens: quota.token_limit - quota.token_used,
        percentageUsed: Math.round((quota.token_used / quota.token_limit) * 100),
        dailyUsage,
        hourlyUsage,
        costUsd: monthlyCost,
        isActive: quota.is_active
      }

    } catch (error) {
      console.error('Erro ao obter status da quota:', error)
      return null
    }
  }

  /**
   * Cria uma nova quota mensal para o usuário
   */
  static async createMonthlyQuota(userId: string, month: string): Promise<any> {
    try {
      // Obter configurações padrão baseadas no role do usuário
      const userRole = await this.getUserRole(userId)
      const settings = await prisma.quota_settings.findUnique({
        where: { role: userRole as any }
      })

      const tokenLimit = settings?.monthly_token_limit || 100000

      return await prisma.quotas.create({
        data: {
          user_id: userId,
          month,
          token_limit: tokenLimit,
          token_used: 0,
          is_active: true
        }
      })

    } catch (error) {
      console.error('Erro ao criar quota mensal:', error)
      throw error
    }
  }

  /**
   * Reseta a quota de um usuário (admin only)
   */
  static async resetQuota(userId: string, month?: string): Promise<void> {
    try {
      const targetMonth = month || this.getCurrentMonth()
      
      await prisma.quotas.updateMany({
        where: {
          user_id: userId,
          month: targetMonth
        },
        data: {
          token_used: 0,
          updated_at: new Date()
        }
      })

      // Limpar logs de uso do mês
      await prisma.quota_usage_log.deleteMany({
        where: {
          user_id: userId,
          created_at: {
            gte: new Date(`${targetMonth}-01`),
            lt: new Date(`${targetMonth}-01`).setMonth(new Date(`${targetMonth}-01`).getMonth() + 1)
          }
        }
      })

    } catch (error) {
      console.error('Erro ao resetar quota:', error)
      throw error
    }
  }

  /**
   * Atualiza o limite de tokens de um usuário (admin only)
   */
  static async updateQuotaLimit(userId: string, newLimit: number, month?: string): Promise<void> {
    try {
      const targetMonth = month || this.getCurrentMonth()
      
      await prisma.quotas.upsert({
        where: {
          unique_user_month_quota: {
            user_id: userId,
            month: targetMonth
          }
        },
        update: {
          token_limit: newLimit,
          updated_at: new Date()
        },
        create: {
          user_id: userId,
          month: targetMonth,
          token_limit: newLimit,
          token_used: 0,
          is_active: true
        }
      })

    } catch (error) {
      console.error('Erro ao atualizar limite de quota:', error)
      throw error
    }
  }

  /**
   * Obtém estatísticas de uso de quotas (admin only)
   */
  static async getQuotaStats(month?: string): Promise<any> {
    try {
      const targetMonth = month || this.getCurrentMonth()
      
      const stats = await prisma.quotas.aggregate({
        where: {
          month: targetMonth,
          is_active: true
        },
        _sum: {
          token_limit: true,
          token_used: true
        },
        _count: {
          id: true
        }
      })

      const topUsers = await prisma.quotas.findMany({
        where: {
          month: targetMonth,
          is_active: true
        },
        orderBy: {
          token_used: 'desc'
        },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      })

      return {
        totalUsers: stats._count.id,
        totalTokenLimit: stats._sum.token_limit || 0,
        totalTokenUsed: stats._sum.token_used || 0,
        averageUsage: stats._count.id > 0 ? Math.round((stats._sum.token_used || 0) / stats._count.id) : 0,
        topUsers
      }

    } catch (error) {
      console.error('Erro ao obter estatísticas de quota:', error)
      throw error
    }
  }

  // Métodos auxiliares privados

  private static getCurrentMonth(): string {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  private static async getUserRole(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })
    return user?.role || 'STUDENT'
  }

  private static async getDailyUsage(userId: string, month: string): Promise<number> {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const result = await prisma.quota_usage_log.aggregate({
      where: {
        user_id: userId,
        created_at: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      _sum: {
        total_tokens: true
      }
    })

    return result._sum.total_tokens || 0
  }

  private static async getHourlyUsage(userId: string): Promise<number> {
    const now = new Date()
    const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())
    const endOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1)

    const result = await prisma.quota_usage_log.aggregate({
      where: {
        user_id: userId,
        created_at: {
          gte: startOfHour,
          lt: endOfHour
        }
      },
      _sum: {
        total_tokens: true
      }
    })

    return result._sum.total_tokens || 0
  }

  private static async getMonthlyCost(userId: string, month: string): Promise<number> {
    const result = await prisma.quota_usage_log.aggregate({
      where: {
        user_id: userId,
        created_at: {
          gte: new Date(`${month}-01`),
          lt: new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1)
        }
      },
      _sum: {
        cost_usd: true
      }
    })

    return Number(result._sum.cost_usd || 0)
  }
}
