import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface PrivacySettings {
  dataRetentionDays: number;
  allowAnalytics: boolean;
  allowPersonalization: boolean;
  allowDataSharing: boolean;
  anonymizeData: boolean;
}

export interface DataDeletionRequest {
  userId: string;
  requestDate: Date;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completedDate?: Date;
}

export class EnemPrivacyService {
  private readonly DEFAULT_RETENTION_DAYS = 547; // 18 months
  private readonly ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY || 'default-key-change-in-production';

  /**
   * Get user's privacy settings
   */
  async getUserPrivacySettings(userId: string): Promise<PrivacySettings> {
    // In a real implementation, this would be stored in a user_preferences table
    // For now, return default settings
    return {
      dataRetentionDays: this.DEFAULT_RETENTION_DAYS,
      allowAnalytics: true,
      allowPersonalization: true,
      allowDataSharing: false,
      anonymizeData: false
    };
  }

  /**
   * Update user's privacy settings
   */
  async updateUserPrivacySettings(userId: string, settings: Partial<PrivacySettings>): Promise<void> {
    // In a real implementation, this would update user_preferences table
    console.log(`Updating privacy settings for user ${userId}:`, settings);
  }

  /**
   * Request data deletion for a user
   */
  async requestDataDeletion(userId: string, reason: string): Promise<string> {
    const requestId = crypto.randomUUID();
    
    // Store deletion request
    const request: DataDeletionRequest = {
      userId,
      requestDate: new Date(),
      reason,
      status: 'pending'
    };

    // In a real implementation, store this in a data_deletion_requests table
    console.log(`Data deletion requested for user ${userId}:`, request);

    return requestId;
  }

  /**
   * Process data deletion request
   */
  async processDataDeletion(requestId: string): Promise<void> {
    // In a real implementation, this would:
    // 1. Find the deletion request
    // 2. Delete all user data from ENEM tables
    // 3. Update the request status
    
    console.log(`Processing data deletion request: ${requestId}`);
    
    // Example of what would be deleted:
    // - enem_session records
    // - enem_response records  
    // - enem_score records
    // - enem_redacao records (encrypted)
    // - Any analytics data
  }

  /**
   * Anonymize user data
   */
  async anonymizeUserData(userId: string): Promise<void> {
    try {
      // Anonymize sessions
      await prisma.enem_session.updateMany({
        where: { user_id: userId },
        data: { 
          user_id: `anon_${crypto.randomUUID()}`,
          // Keep session data but remove personal identifiers
        }
      });

      // Anonymize responses (they're linked to sessions, so they'll be anonymized too)
      // Responses don't contain direct user identifiers

      // Anonymize scores
      await prisma.enem_score.updateMany({
        where: { 
          session: {
            user_id: userId
          }
        },
        data: {
          // Scores are already anonymized through session anonymization
        }
      });

      console.log(`Anonymized data for user: ${userId}`);
    } catch (error) {
      console.error('Error anonymizing user data:', error);
      throw error;
    }
  }

  /**
   * Encrypt sensitive data
   */
  encryptSensitiveData(data: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.ENCRYPTION_KEY);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  decryptSensitiveData(encryptedData: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', this.ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Clean up expired data based on retention policy
   */
  async cleanupExpiredData(): Promise<{
    deletedSessions: number;
    deletedResponses: number;
    deletedScores: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.DEFAULT_RETENTION_DAYS);

    try {
      // Delete expired sessions (this will cascade to responses and scores)
      const deletedSessions = await prisma.enem_session.deleteMany({
        where: {
          start_time: {
            lt: cutoffDate
          }
        }
      });

      // Count related deletions
      const deletedResponses = await prisma.enem_response.count({
        where: {
          session: {
            start_time: {
              lt: cutoffDate
            }
          }
        }
      });

      const deletedScores = await prisma.enem_score.count({
        where: {
          session: {
            start_time: {
              lt: cutoffDate
            }
          }
        }
      });

      console.log(`Cleaned up expired data: ${deletedSessions.count} sessions, ${deletedResponses} responses, ${deletedScores} scores`);

      return {
        deletedSessions: deletedSessions.count,
        deletedResponses,
        deletedScores
      };
    } catch (error) {
      console.error('Error cleaning up expired data:', error);
      throw error;
    }
  }

  /**
   * Generate privacy report for a user
   */
  async generatePrivacyReport(userId: string): Promise<{
    totalSessions: number;
    totalResponses: number;
    totalScores: number;
    dataRetentionPolicy: string;
    lastDataUpdate: Date;
    dataTypes: string[];
  }> {
    const sessions = await prisma.enem_session.findMany({
      where: { user_id: userId },
      include: {
        responses: true,
        score: true
      }
    });

    const totalSessions = sessions.length;
    const totalResponses = sessions.reduce((sum, session) => sum + session.responses.length, 0);
    const totalScores = sessions.filter(session => session.score).length;

    const lastDataUpdate = sessions.length > 0 
      ? new Date(Math.max(...sessions.map(s => s.start_time.getTime())))
      : new Date();

    return {
      totalSessions,
      totalResponses,
      totalScores,
      dataRetentionPolicy: `${this.DEFAULT_RETENTION_DAYS} dias (18 meses)`,
      lastDataUpdate,
      dataTypes: [
        'Dados de sessão de simulado',
        'Respostas às questões',
        'Pontuações e análises',
        'Tempo gasto por questão',
        'Metadados de desempenho'
      ]
    };
  }

  /**
   * Check if user data can be exported
   */
  async canExportUserData(userId: string): Promise<boolean> {
    // Check if user has consented to data export
    const settings = await this.getUserPrivacySettings(userId);
    return settings.allowDataSharing;
  }

  /**
   * Export user data in LGPD-compliant format
   */
  async exportUserData(userId: string): Promise<{
    personalData: any;
    sessionData: any[];
    responseData: any[];
    scoreData: any[];
    metadata: {
      exportDate: string;
      dataRetentionPolicy: string;
      anonymizationStatus: string;
    };
  }> {
    const sessions = await prisma.enem_session.findMany({
      where: { user_id: userId },
      include: {
        responses: true,
        score: true
      }
    });

    const personalData = {
      userId: userId,
      dataTypes: ['Sessões de simulado', 'Respostas', 'Pontuações'],
      retentionPeriod: `${this.DEFAULT_RETENTION_DAYS} dias`
    };

    const sessionData = sessions.map(session => ({
      sessionId: session.session_id,
      mode: session.mode,
      areas: session.area,
      startTime: session.start_time,
      endTime: session.end_time,
      status: session.status,
      config: session.config
    }));

    const responseData = sessions.flatMap(session => 
      session.responses.map(response => ({
        responseId: response.response_id,
        sessionId: response.session_id,
        itemId: response.item_id,
        selectedAnswer: response.selected_answer,
        timeSpent: response.time_spent,
        isCorrect: response.is_correct,
        timestamp: response.timestamp
      }))
    );

    const scoreData = sessions
      .filter(session => session.score)
      .map(session => ({
        scoreId: session.score!.score_id,
        sessionId: session.score!.session_id,
        areaScores: session.score!.area_scores,
        totalScore: session.score!.total_score,
        triEstimated: session.score!.tri_estimated,
        stats: session.score!.stats,
        createdAt: session.score!.created_at
      }));

    return {
      personalData,
      sessionData,
      responseData,
      scoreData,
      metadata: {
        exportDate: new Date().toISOString(),
        dataRetentionPolicy: `${this.DEFAULT_RETENTION_DAYS} dias`,
        anonymizationStatus: 'Dados não anonimizados conforme solicitação do usuário'
      }
    };
  }

  /**
   * Clean up connections
   */
  async cleanup(): Promise<void> {
    await prisma.$disconnect();
  }
}
