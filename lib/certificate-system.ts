import { prisma } from '@/lib/db'

export interface Certificate {
  id: string
  userId: string
  title: string
  description: string
  type: CertificateType
  module: string
  completedAt: Date
  issuedAt: Date
  certificateUrl?: string
  metadata?: any
}

export interface CertificateProgress {
  userId: string
  module: string
  progress: number // 0-100
  completed: boolean
  nextMilestone?: string
  estimatedTimeToComplete?: number // em minutos
}

export type CertificateType = 
  | 'LESSON_COMPLETION'
  | 'MODULE_MASTERY'
  | 'STREAK_ACHIEVEMENT'
  | 'WEEKLY_GOAL'
  | 'ENEM_PREPARATION'
  | 'ESSAY_MASTERY'

export class CertificateSystem {
  // Configurações de certificados
  private static readonly CERTIFICATE_CONFIG = {
    LESSON_COMPLETION: {
      threshold: 1, // 1 aula completada
      title: 'Aula Concluída',
      description: 'Parabéns! Você completou uma aula interativa.'
    },
    MODULE_MASTERY: {
      threshold: 5, // 5 aulas no módulo
      title: 'Mestre do Módulo',
      description: 'Excelente! Você dominou este módulo com 5 aulas completadas.'
    },
    STREAK_ACHIEVEMENT: {
      threshold: 7, // 7 dias consecutivos
      title: 'Sequência de Estudos',
      description: 'Incrível! Você manteve uma sequência de 7 dias estudando.'
    },
    WEEKLY_GOAL: {
      threshold: 10, // 10 aulas na semana
      title: 'Meta Semanal',
      description: 'Parabéns! Você atingiu sua meta semanal de estudos.'
    },
    ENEM_PREPARATION: {
      threshold: 20, // 20 simulados completados
      title: 'Preparado para o ENEM',
      description: 'Fantástico! Você completou 20 simulados do ENEM.'
    },
    ESSAY_MASTERY: {
      threshold: 10, // 10 redações corrigidas
      title: 'Mestre em Redação',
      description: 'Excelente! Você corrigiu 10 redações e melhorou sua escrita.'
    }
  }

  /**
   * Verifica se o usuário deve receber um certificado
   */
  static async checkAndIssueCertificate(
    userId: string,
    module: string,
    action: string,
    metadata?: any
  ): Promise<Certificate | null> {
    try {
      // Determinar tipo de certificado baseado na ação
      let certificateType: CertificateType | null = null
      
      switch (action) {
        case 'lesson_completed':
          certificateType = 'LESSON_COMPLETION'
          break
        case 'module_mastery':
          certificateType = 'MODULE_MASTERY'
          break
        case 'daily_streak':
          certificateType = 'STREAK_ACHIEVEMENT'
          break
        case 'weekly_goal':
          certificateType = 'WEEKLY_GOAL'
          break
        case 'enem_simulation':
          certificateType = 'ENEM_PREPARATION'
          break
        case 'essay_correction':
          certificateType = 'ESSAY_MASTERY'
          break
        default:
          return null
      }

      if (!certificateType) return null

      // Verificar se já possui este certificado
      const existingCertificate = await prisma.certificates.findFirst({
        where: {
          user_id: userId,
          type: certificateType,
          module: module
        }
      })

      if (existingCertificate) {
        return null // Já possui o certificado
      }

      // Verificar se atingiu o threshold
      const hasReachedThreshold = await this.checkThreshold(
        userId,
        module,
        certificateType,
        metadata
      )

      if (!hasReachedThreshold) {
        return null
      }

      // Emitir certificado
      return await this.issueCertificate(userId, module, certificateType, metadata)

    } catch (error) {
      console.error('Erro ao verificar certificado:', error)
      return null
    }
  }

  /**
   * Emite um novo certificado
   */
  static async issueCertificate(
    userId: string,
    module: string,
    type: CertificateType,
    metadata?: any
  ): Promise<Certificate> {
    const config = this.CERTIFICATE_CONFIG[type]
    
    const certificate = await prisma.certificates.create({
      data: {
        user_id: userId,
        title: config.title,
        description: config.description,
        type: type,
        module: module,
        completed_at: new Date(),
        issued_at: new Date(),
        metadata: metadata || {}
      }
    })

    // Gerar URL do certificado (implementar geração de PDF em produção)
    const certificateUrl = await this.generateCertificateUrl(certificate.id)
    
    // Atualizar com URL
    await prisma.certificates.update({
      where: { id: certificate.id },
      data: { certificate_url: certificateUrl }
    })

    // Enviar notificação (implementar em produção)
    await this.sendCertificateNotification(userId, certificate)

    return {
      id: certificate.id,
      userId: certificate.user_id,
      title: certificate.title,
      description: certificate.description,
      type: certificate.type as CertificateType,
      module: certificate.module,
      completedAt: certificate.completed_at,
      issuedAt: certificate.issued_at,
      certificateUrl: certificate.certificate_url || undefined,
      metadata: certificate.metadata
    }
  }

  /**
   * Obtém certificados do usuário
   */
  static async getUserCertificates(userId: string): Promise<Certificate[]> {
    try {
      const certificates = await prisma.certificates.findMany({
        where: { user_id: userId },
        orderBy: { issued_at: 'desc' }
      })

      return certificates.map(cert => ({
        id: cert.id,
        userId: cert.user_id,
        title: cert.title,
        description: cert.description,
        type: cert.type as CertificateType,
        module: cert.module,
        completedAt: cert.completed_at,
        issuedAt: cert.issued_at,
        certificateUrl: cert.certificate_url || undefined,
        metadata: cert.metadata
      }))

    } catch (error) {
      console.error('Erro ao obter certificados do usuário:', error)
      return []
    }
  }

  /**
   * Obtém progresso do usuário em direção aos certificados
   */
  static async getUserProgress(userId: string): Promise<CertificateProgress[]> {
    try {
      const progress: CertificateProgress[] = []

      // Progresso para cada tipo de certificado
      for (const [type, config] of Object.entries(this.CERTIFICATE_CONFIG)) {
        const certificateType = type as CertificateType
        
        // Verificar se já possui o certificado
        const hasCertificate = await prisma.certificates.findFirst({
          where: {
            user_id: userId,
            type: certificateType
          }
        })

        if (hasCertificate) {
          progress.push({
            userId,
            module: 'all',
            progress: 100,
            completed: true
          })
          continue
        }

        // Calcular progresso atual
        const currentProgress = await this.calculateProgress(
          userId,
          certificateType
        )

        const threshold = config.threshold
        const progressPercentage = Math.min(100, (currentProgress / threshold) * 100)

        progress.push({
          userId,
          module: 'all',
          progress: Math.round(progressPercentage),
          completed: progressPercentage >= 100,
          nextMilestone: this.getNextMilestone(certificateType, currentProgress),
          estimatedTimeToComplete: this.estimateTimeToComplete(
            certificateType,
            currentProgress,
            threshold
          )
        })
      }

      return progress

    } catch (error) {
      console.error('Erro ao obter progresso do usuário:', error)
      return []
    }
  }

  // Métodos privados

  private static async checkThreshold(
    userId: string,
    module: string,
    type: CertificateType,
    metadata?: any
  ): Promise<boolean> {
    const config = this.CERTIFICATE_CONFIG[type]
    
    switch (type) {
      case 'LESSON_COMPLETION':
        // Verificar se completou pelo menos 1 aula
        const lessonCount = await prisma.lesson_completions.count({
          where: { user_id: userId, module: module }
        })
        return lessonCount >= config.threshold

      case 'MODULE_MASTERY':
        // Verificar se completou 5 aulas no módulo
        const moduleLessonCount = await prisma.lesson_completions.count({
          where: { user_id: userId, module: module }
        })
        return moduleLessonCount >= config.threshold

      case 'STREAK_ACHIEVEMENT':
        // Verificar sequência de dias estudando
        const streak = await this.calculateStudyStreak(userId)
        return streak >= config.threshold

      case 'WEEKLY_GOAL':
        // Verificar aulas completadas na semana
        const weeklyLessons = await this.getWeeklyLessonCount(userId)
        return weeklyLessons >= config.threshold

      case 'ENEM_PREPARATION':
        // Verificar simulados ENEM completados
        const enemSimulations = await prisma.enem_sessions.count({
          where: { user_id: userId, status: 'completed' }
        })
        return enemSimulations >= config.threshold

      case 'ESSAY_MASTERY':
        // Verificar redações corrigidas
        const essayCorrections = await prisma.redacao_corrections.count({
          where: { user_id: userId }
        })
        return essayCorrections >= config.threshold

      default:
        return false
    }
  }

  private static async calculateProgress(
    userId: string,
    type: CertificateType
  ): Promise<number> {
    const config = this.CERTIFICATE_CONFIG[type]
    
    switch (type) {
      case 'LESSON_COMPLETION':
        return await prisma.lesson_completions.count({
          where: { user_id: userId }
        })

      case 'MODULE_MASTERY':
        return await prisma.lesson_completions.count({
          where: { user_id: userId }
        })

      case 'STREAK_ACHIEVEMENT':
        return await this.calculateStudyStreak(userId)

      case 'WEEKLY_GOAL':
        return await this.getWeeklyLessonCount(userId)

      case 'ENEM_PREPARATION':
        return await prisma.enem_sessions.count({
          where: { user_id: userId, status: 'completed' }
        })

      case 'ESSAY_MASTERY':
        return await prisma.redacao_corrections.count({
          where: { user_id: userId }
        })

      default:
        return 0
    }
  }

  private static async calculateStudyStreak(userId: string): Promise<number> {
    // Implementar cálculo de sequência de dias estudando
    // Por enquanto, retornar valor mock
    return 3
  }

  private static async getWeeklyLessonCount(userId: string): Promise<number> {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    return await prisma.lesson_completions.count({
      where: {
        user_id: userId,
        completed_at: {
          gte: oneWeekAgo
        }
      }
    })
  }

  private static getNextMilestone(type: CertificateType, current: number): string {
    const config = this.CERTIFICATE_CONFIG[type]
    const remaining = config.threshold - current
    
    switch (type) {
      case 'LESSON_COMPLETION':
        return `Complete mais ${remaining} aula${remaining > 1 ? 's' : ''}`
      case 'MODULE_MASTERY':
        return `Complete mais ${remaining} aula${remaining > 1 ? 's' : ''} neste módulo`
      case 'STREAK_ACHIEVEMENT':
        return `Estude por mais ${remaining} dia${remaining > 1 ? 's' : ''} consecutivo${remaining > 1 ? 's' : ''}`
      case 'WEEKLY_GOAL':
        return `Complete mais ${remaining} aula${remaining > 1 ? 's' : ''} esta semana`
      case 'ENEM_PREPARATION':
        return `Complete mais ${remaining} simulado${remaining > 1 ? 's' : ''} do ENEM`
      case 'ESSAY_MASTERY':
        return `Corrija mais ${remaining} redação${remaining > 1 ? 'ões' : ''}`
      default:
        return 'Continue estudando!'
    }
  }

  private static estimateTimeToComplete(
    type: CertificateType,
    current: number,
    threshold: number
  ): number {
    const remaining = threshold - current
    if (remaining <= 0) return 0

    // Estimativas baseadas no tipo de certificado
    switch (type) {
      case 'LESSON_COMPLETION':
        return remaining * 30 // 30 min por aula
      case 'MODULE_MASTERY':
        return remaining * 30 // 30 min por aula
      case 'STREAK_ACHIEVEMENT':
        return remaining * 20 // 20 min por dia
      case 'WEEKLY_GOAL':
        return remaining * 30 // 30 min por aula
      case 'ENEM_PREPARATION':
        return remaining * 180 // 3 horas por simulado
      case 'ESSAY_MASTERY':
        return remaining * 60 // 1 hora por redação
      default:
        return remaining * 30
    }
  }

  private static async generateCertificateUrl(certificateId: string): Promise<string> {
    // Em produção, implementar geração de PDF do certificado
    // Por enquanto, retornar URL mock
    return `/certificates/${certificateId}.pdf`
  }

  private static async sendCertificateNotification(
    userId: string,
    certificate: any
  ): Promise<void> {
    // Em produção, implementar envio de notificação
    // Email, push notification, etc.
    console.log(`🎉 Certificado emitido para usuário ${userId}: ${certificate.title}`)
  }
}
