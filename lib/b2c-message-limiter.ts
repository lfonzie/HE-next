import { prisma } from '@/lib/db'

export interface MessageLimitResult {
  allowed: boolean
  remainingMessages: number
  limitExceeded: boolean
  message?: string
  resetTime?: Date
}

export interface DailyMessageUsage {
  userId: string
  date: string
  messageCount: number
  limit: number
  remaining: number
  resetTime: Date
}

export class B2CMessageLimiter {
  // Limite de mensagens por dia para usuários B2C
  private static readonly DAILY_MESSAGE_LIMIT = 100
  
  // Limite de mensagens por dia para usuários FREE (sem cadastro)
  private static readonly FREE_DAILY_MESSAGE_LIMIT = 50

  /**
   * Verifica se o usuário pode enviar uma mensagem
   */
  static async checkMessageLimit(
    userId: string | null,
    userRole?: string
  ): Promise<MessageLimitResult> {
    try {
      // Se não há userId (usuário anônimo), usar limite FREE
      if (!userId) {
        return await this.checkAnonymousLimit()
      }

      // Verificar se é usuário B2C (STUDENT role)
      const isB2CUser = userRole === 'STUDENT' || userRole === 'FREE'
      
      if (isB2CUser) {
        return await this.checkB2CLimit(userId)
      }

      // Usuários não-B2C (TEACHER, ADMIN, etc.) não têm limitação
      return {
        allowed: true,
        remainingMessages: -1, // Ilimitado
        limitExceeded: false
      }

    } catch (error) {
      console.error('Erro ao verificar limite de mensagens:', error)
      // Em caso de erro, permitir a mensagem
      return {
        allowed: true,
        remainingMessages: 0,
        limitExceeded: false,
        message: 'Erro ao verificar limite - mensagem permitida'
      }
    }
  }

  /**
   * Registra o uso de uma mensagem
   */
  static async recordMessageUsage(
    userId: string | null,
    userRole?: string,
    module?: string,
    conversationId?: string
  ): Promise<void> {
    try {
      if (!userId) {
        // Para usuários anônimos, registrar em cache/session
        await this.recordAnonymousUsage()
        return
      }

      const isB2CUser = userRole === 'STUDENT' || userRole === 'FREE'
      
      if (isB2CUser) {
        await this.recordB2CUsage(userId, module, conversationId)
      }

    } catch (error) {
      console.error('Erro ao registrar uso de mensagem:', error)
    }
  }

  /**
   * Obtém o status atual de uso de mensagens
   */
  static async getMessageUsageStatus(
    userId: string | null,
    userRole?: string
  ): Promise<DailyMessageUsage | null> {
    try {
      if (!userId) {
        return await this.getAnonymousUsageStatus()
      }

      const isB2CUser = userRole === 'STUDENT' || userRole === 'FREE'
      
      if (isB2CUser) {
        return await this.getB2CUsageStatus(userId)
      }

      return null // Usuários não-B2C não têm limitação

    } catch (error) {
      console.error('Erro ao obter status de uso de mensagens:', error)
      return null
    }
  }

  // Métodos privados

  private static async checkB2CLimit(userId: string): Promise<MessageLimitResult> {
    const today = this.getTodayString()
    const limit = this.DAILY_MESSAGE_LIMIT

    // Buscar uso do dia atual
    const usage = await prisma.daily_message_usage.findUnique({
      where: {
        unique_user_date: {
          user_id: userId,
          date: today
        }
      }
    })

    const messageCount = usage?.message_count || 0
    const remaining = Math.max(0, limit - messageCount)
    const resetTime = this.getTomorrowStart()

    if (messageCount >= limit) {
      return {
        allowed: false,
        remainingMessages: 0,
        limitExceeded: true,
        message: `Limite diário de mensagens excedido. Você pode enviar ${limit} mensagens por dia.`,
        resetTime
      }
    }

    return {
      allowed: true,
      remainingMessages: remaining,
      limitExceeded: false,
      resetTime
    }
  }

  private static async checkAnonymousLimit(): Promise<MessageLimitResult> {
    // Para usuários anônimos, usar localStorage/sessionStorage
    // ou implementar um sistema de cache simples
    const limit = this.FREE_DAILY_MESSAGE_LIMIT
    
    // Por enquanto, sempre permitir para usuários anônimos
    // Em produção, implementar cache Redis ou similar
    return {
      allowed: true,
      remainingMessages: limit,
      limitExceeded: false,
      message: `Usuário anônimo: ${limit} mensagens disponíveis hoje`
    }
  }

  private static async recordB2CUsage(
    userId: string,
    module?: string,
    conversationId?: string
  ): Promise<void> {
    const today = this.getTodayString()

    // Upsert do uso diário
    await prisma.daily_message_usage.upsert({
      where: {
        unique_user_date: {
          user_id: userId,
          date: today
        }
      },
      update: {
        message_count: {
          increment: 1
        },
        updated_at: new Date()
      },
      create: {
        user_id: userId,
        date: today,
        message_count: 1,
        module: module || 'chat',
        conversation_id: conversationId
      }
    })

    // Registrar log detalhado
    await prisma.message_usage_log.create({
      data: {
        user_id: userId,
        date: today,
        module: module || 'chat',
        conversation_id: conversationId,
        timestamp: new Date()
      }
    })
  }

  private static async recordAnonymousUsage(): Promise<void> {
    // Para usuários anônimos, implementar cache local
    // Em produção, usar Redis ou similar
    console.log('Registrando uso de mensagem para usuário anônimo')
  }

  private static async getB2CUsageStatus(userId: string): Promise<DailyMessageUsage> {
    const today = this.getTodayString()
    const limit = this.DAILY_MESSAGE_LIMIT

    const usage = await prisma.daily_message_usage.findUnique({
      where: {
        unique_user_date: {
          user_id: userId,
          date: today
        }
      }
    })

    const messageCount = usage?.message_count || 0
    const remaining = Math.max(0, limit - messageCount)

    return {
      userId,
      date: today,
      messageCount,
      limit,
      remaining,
      resetTime: this.getTomorrowStart()
    }
  }

  private static async getAnonymousUsageStatus(): Promise<DailyMessageUsage> {
    const limit = this.FREE_DAILY_MESSAGE_LIMIT
    
    return {
      userId: 'anonymous',
      date: this.getTodayString(),
      messageCount: 0, // Implementar cache em produção
      limit,
      remaining: limit,
      resetTime: this.getTomorrowStart()
    }
  }

  private static getTodayString(): string {
    const today = new Date()
    return today.toISOString().split('T')[0] // YYYY-MM-DD
  }

  private static getTomorrowStart(): Date {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow
  }

  /**
   * Reseta o limite de mensagens de um usuário (admin only)
   */
  static async resetMessageLimit(userId: string, date?: string): Promise<void> {
    try {
      const targetDate = date || this.getTodayString()
      
      await prisma.daily_message_usage.deleteMany({
        where: {
          user_id: userId,
          date: targetDate
        }
      })

      await prisma.message_usage_log.deleteMany({
        where: {
          user_id: userId,
          date: targetDate
        }
      })

    } catch (error) {
      console.error('Erro ao resetar limite de mensagens:', error)
      throw error
    }
  }

  /**
   * Obtém estatísticas de uso de mensagens (admin only)
   */
  static async getMessageStats(date?: string): Promise<any> {
    try {
      const targetDate = date || this.getTodayString()
      
      const stats = await prisma.daily_message_usage.aggregate({
        where: {
          date: targetDate
        },
        _sum: {
          message_count: true
        },
        _count: {
          id: true
        }
      })

      const topUsers = await prisma.daily_message_usage.findMany({
        where: {
          date: targetDate
        },
        orderBy: {
          message_count: 'desc'
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
        date: targetDate,
        totalUsers: stats._count.id,
        totalMessages: stats._sum.message_count || 0,
        averageMessages: stats._count.id > 0 ? Math.round((stats._sum.message_count || 0) / stats._count.id) : 0,
        topUsers
      }

    } catch (error) {
      console.error('Erro ao obter estatísticas de mensagens:', error)
      throw error
    }
  }
}
