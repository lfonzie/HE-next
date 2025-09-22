// app/api/admin/stats-enhanced/route.js
// API para estatísticas aprimoradas incluindo métricas de aulas

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAdminTracing, withDatabaseTracing, updateEntityCounts } from '@/lib/admin-telemetry';

const prisma = new PrismaClient();

export async function GET() {
  return withAdminTracing('admin.stats.enhanced.get', async () => {
    // Estatísticas básicas existentes
    const [
      totalUsers,
      totalLessons,
      totalChats
    ] = await Promise.all([
      withDatabaseTracing('count', 'user', () => prisma.user.count()),
      withDatabaseTracing('count', 'lesson_meta', () => prisma.lesson_meta.count()),
      withDatabaseTracing('count', 'conversations', () => prisma.conversations.count())
    ]);

    // Buscar aulas recentes
    const recentLessons = await withDatabaseTracing('findMany', 'lesson_meta', () => 
      prisma.lesson_meta.findMany({
        take: 10,
        orderBy: { updated_at: 'desc' }
      })
    );

    // Estatísticas de uso por período
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [lessonsLastWeek, lessonsLastMonth] = await Promise.all([
      withDatabaseTracing('count', 'lesson_meta', () => 
        prisma.lesson_meta.count({
          where: { updated_at: { gte: lastWeek } }
        })
      ),
      withDatabaseTracing('count', 'lesson_meta', () => 
        prisma.lesson_meta.count({
          where: { updated_at: { gte: lastMonth } }
        })
      )
    ]);

    // Update entity counts for metrics
    updateEntityCounts({
      users: totalUsers,
      conversations: totalChats,
    });

    return NextResponse.json({
      success: true,
      stats: {
        // Estatísticas básicas
        users: {
          total: totalUsers,
          growth: 'N/A' // Implementar cálculo de crescimento
        },
        lessons: {
          total: totalLessons,
          lastWeek: lessonsLastWeek,
          lastMonth: lessonsLastMonth,
          bySubject: [] // Simplificado por enquanto
        },
        chats: {
          total: totalChats
        },
        
        // Métricas de pacing profissional (simplificadas)
        pacing: {
          totalLessonsWithMetrics: 0,
          averageDuration: 45,
          averageTokens: 4500,
          averageQuality: 85,
          totalImages: 0,
          estimatedTotalSize: 0
        },
        
        // Estatísticas de custos (simplificadas)
        costs: {
          estimatedTotal: 0,
          averagePerLesson: 0,
          currency: 'BRL'
        },
        
        // Aulas recentes
        recentLessons: recentLessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title || 'Aula sem título',
          subject: lesson.subject || 'Geral',
          grade: lesson.grade || 'N/A',
          createdAt: lesson.updated_at,
          userName: 'Usuário',
          userEmail: 'N/A'
        }))
      }
    });
  }, {
    'admin.endpoint': '/api/admin/stats-enhanced',
    'admin.method': 'GET',
  });
}