import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface EnemMetrics {
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  averageScore: number;
  averageTimeSpent: number;
  completionRate: number;
  sessionsByMode: Record<string, number>;
  sessionsByArea: Record<string, number>;
  scoreDistribution: {
    excellent: number; // >= 80%
    good: number;      // 60-79%
    regular: number;   // 40-59%
    poor: number;      // < 40%
  };
  topPerformingTopics: Array<{ topic: string; accuracy: number; count: number }>;
  weakTopics: Array<{ topic: string; accuracy: number; count: number }>;
  dailyStats: Array<{
    date: string;
    sessions: number;
    averageScore: number;
    completionRate: number;
  }>;
}

export interface EnemLogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  service: string;
  action: string;
  sessionId?: string;
  userId?: string;
  metadata?: any;
  message: string;
}

export class EnemObservabilityService {
  /**
   * Get comprehensive metrics for ENEM simulator
   */
  async getMetrics(timeRange: { start: Date; end: Date }): Promise<EnemMetrics> {
    try {
      const sessions = await prisma.enem_session.findMany({
        where: {
          start_time: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        },
        include: {
          responses: true,
          score: true
        }
      });

      const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
    const abandonedSessions = sessions.filter(s => s.status === 'ABANDONED').length;
    
    const scores = sessions.filter(s => s.score).map(s => s.score!.total_score);
    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    
    const times = sessions.filter(s => s.end_time).map(s => 
      (s.end_time!.getTime() - s.start_time.getTime()) / 1000 / 60
    );
    const averageTimeSpent = times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
    
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Sessions by mode
    const sessionsByMode: Record<string, number> = {};
    sessions.forEach(session => {
      sessionsByMode[session.mode] = (sessionsByMode[session.mode] || 0) + 1;
    });

    // Sessions by area
    const sessionsByArea: Record<string, number> = {};
    sessions.forEach(session => {
      session.area.forEach(area => {
        sessionsByArea[area] = (sessionsByArea[area] || 0) + 1;
      });
    });

    // Score distribution
    const scoreDistribution = {
      excellent: 0,
      good: 0,
      regular: 0,
      poor: 0
    };
    
    scores.forEach(score => {
      if (score >= 80) scoreDistribution.excellent++;
      else if (score >= 60) scoreDistribution.good++;
      else if (score >= 40) scoreDistribution.regular++;
      else scoreDistribution.poor++;
    });

    // Topic analysis
    const topicStats: Record<string, { correct: number; total: number }> = {};
    sessions.forEach(session => {
      if (session.score?.stats && typeof session.score.stats === 'object' && 'accuracy_by_topic' in session.score.stats) {
        const stats = session.score.stats as any;
        Object.entries(stats.accuracy_by_topic).forEach(([topic, accuracy]) => {
          if (!topicStats[topic]) {
            topicStats[topic] = { correct: 0, total: 0 };
          }
          topicStats[topic].total++;
          topicStats[topic].correct += typeof accuracy === 'number' ? accuracy : 0;
        });
      }
    });

    const topPerformingTopics = Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
        count: stats.total
      }))
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 10);

    const weakTopics = Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
        count: stats.total
      }))
      .filter(item => item.accuracy < 0.5)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10);

    // Daily stats
    const dailyStats = await this.getDailyStats(timeRange);

    return {
      totalSessions,
      completedSessions,
      abandonedSessions,
      averageScore,
      averageTimeSpent,
      completionRate,
      sessionsByMode,
      sessionsByArea,
      scoreDistribution,
      topPerformingTopics,
      weakTopics,
      dailyStats
    };
    } catch (error) {
      console.error('Error fetching ENEM metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  private getDefaultMetrics(): EnemMetrics {
    return {
      totalSessions: 0,
      completedSessions: 0,
      abandonedSessions: 0,
      averageScore: 0,
      averageTimeSpent: 0,
      completionRate: 0,
      sessionsByMode: {},
      sessionsByArea: {},
      scoreDistribution: {
        excellent: 0,
        good: 0,
        regular: 0,
        poor: 0
      },
      topPerformingTopics: [],
      weakTopics: [],
      dailyStats: []
    };
  }

  /**
   * Get daily statistics
   */
  private async getDailyStats(timeRange: { start: Date; end: Date }) {
    const sessions = await prisma.enem_session.findMany({
      where: {
        start_time: {
          gte: timeRange.start,
          lte: timeRange.end
        }
      },
      include: {
        score: true
      },
      orderBy: {
        start_time: 'asc'
      }
    });

    const dailyMap = new Map<string, {
      sessions: number;
      completed: number;
      scores: number[];
    }>();

    sessions.forEach(session => {
      const date = session.start_time.toISOString().split('T')[0];
      const dayData = dailyMap.get(date) || { sessions: 0, completed: 0, scores: [] };
      
      dayData.sessions++;
      if (session.status === 'COMPLETED') {
        dayData.completed++;
      }
      if (session.score) {
        dayData.scores.push(session.score.total_score);
      }
      
      dailyMap.set(date, dayData);
    });

    return Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      sessions: data.sessions,
      averageScore: data.scores.length > 0 
        ? data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length 
        : 0,
      completionRate: data.sessions > 0 ? (data.completed / data.sessions) * 100 : 0
    }));
  }

  /**
   * Log an event
   */
  async logEvent(entry: EnemLogEntry): Promise<void> {
    try {
      // Store in database (you might want to use a separate logging table)
      await prisma.events.create({
        data: {
          occurred_at: entry.timestamp,
          tenant_id: 'enem-simulator',
          user_id: entry.userId,
          session_id: entry.sessionId || 'system',
          channel: 'web',
          route: '/enem',
          module: 'enem-simulator',
          action: entry.action as any,
          metadata: entry.metadata || {},
          latency_ms: 0,
          status_code: 200
        }
      });

      // Also log to console for development
      console.log(`[ENEM] ${entry.level.toUpperCase()} - ${entry.message}`, entry);
    } catch (error) {
      console.error('Failed to log ENEM event:', error);
    }
  }

  /**
   * Get recent logs
   */
  async getRecentLogs(limit: number = 100): Promise<EnemLogEntry[]> {
    const events = await prisma.events.findMany({
      where: {
        module: 'enem-simulator'
      },
      orderBy: {
        occurred_at: 'desc'
      },
      take: limit
    });

    return events.map(event => ({
      timestamp: event.occurred_at,
      level: 'info' as const,
      service: 'enem-simulator',
      action: event.action,
      sessionId: event.session_id,
      userId: event.user_id || undefined,
      metadata: event.metadata,
      message: `Action: ${event.action}`
    }));
  }

  /**
   * Get performance alerts
   */
  async getPerformanceAlerts(): Promise<Array<{
    type: 'high_abandonment' | 'low_completion' | 'slow_performance' | 'error_spike';
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp: Date;
    metadata: any;
  }>> {
    try {
      const alerts: Array<{
        type: 'high_abandonment' | 'low_completion' | 'slow_performance' | 'error_spike';
        severity: 'low' | 'medium' | 'high';
        message: string;
        timestamp: Date;
        metadata: any;
      }> = [];

      // Check for high abandonment rate (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const recentSessions = await prisma.enem_session.findMany({
      where: {
        start_time: {
          gte: yesterday
        }
      }
    });

    const totalRecent = recentSessions.length;
    const abandonedRecent = recentSessions.filter(s => s.status === 'ABANDONED').length;
    const abandonmentRate = totalRecent > 0 ? (abandonedRecent / totalRecent) * 100 : 0;

    if (abandonmentRate > 50) {
      alerts.push({
        type: 'high_abandonment',
        severity: abandonmentRate > 70 ? 'high' : 'medium',
        message: `High abandonment rate: ${abandonmentRate.toFixed(1)}%`,
        timestamp: new Date(),
        metadata: { abandonmentRate, totalSessions: totalRecent }
      });
    }

    // Check for low completion rate
    const completedRecent = recentSessions.filter(s => s.status === 'COMPLETED').length;
    const completionRate = totalRecent > 0 ? (completedRecent / totalRecent) * 100 : 0;

    if (completionRate < 30) {
      alerts.push({
        type: 'low_completion',
        severity: completionRate < 20 ? 'high' : 'medium',
        message: `Low completion rate: ${completionRate.toFixed(1)}%`,
        timestamp: new Date(),
        metadata: { completionRate, totalSessions: totalRecent }
      });
    }

    // Check for slow performance (sessions taking too long)
    const longSessions = recentSessions.filter(session => {
      if (!session.end_time) return false;
      const duration = (session.end_time.getTime() - session.start_time.getTime()) / 1000 / 60;
      return duration > 300; // More than 5 hours
    });

    if (longSessions.length > 0) {
      alerts.push({
        type: 'slow_performance',
        severity: 'low',
        message: `${longSessions.length} sessions took longer than 5 hours`,
        timestamp: new Date(),
        metadata: { longSessions: longSessions.length }
      });
    }

      return alerts;
    } catch (error) {
      console.error('Error fetching ENEM performance alerts:', error);
      return [];
    }
  }

  /**
   * Get data quality report
   */
  async getDataQualityReport(): Promise<{
    totalItems: number;
    itemsWithAssets: number;
    itemsWithoutAssets: number;
    duplicateItems: number;
    invalidItems: number;
    coverageByYear: Record<number, number>;
    coverageByArea: Record<string, number>;
  }> {
    try {
      const items = await prisma.enem_item.findMany();

      const totalItems = items.length;
      // Since the enem_item model doesn't have the expected properties,
      // we'll return basic statistics for now
      const itemsWithAssets = 0; // Not available in current schema
      const itemsWithoutAssets = totalItems;
      const duplicateItems = 0; // Would need content_hash field
      const invalidItems = 0; // Would need text, correct_answer, alternatives fields

      // Coverage statistics (would need year and area fields)
      const coverageByYear: Record<number, number> = {};
      const coverageByArea: Record<string, number> = {};

      return {
        totalItems,
        itemsWithAssets,
        itemsWithoutAssets,
        duplicateItems,
        invalidItems,
        coverageByYear,
        coverageByArea
      };
    } catch (error) {
      console.error('Error fetching ENEM data quality report:', error);
      return {
        totalItems: 0,
        itemsWithAssets: 0,
        itemsWithoutAssets: 0,
        duplicateItems: 0,
        invalidItems: 0,
        coverageByYear: {},
        coverageByArea: {}
      };
    }
  }

  /**
   * Clean up connections
   */
  async cleanup(): Promise<void> {
    await prisma.$disconnect();
  }
}
