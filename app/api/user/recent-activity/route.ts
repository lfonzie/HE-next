/**
 * API para atividades recentes do usuário no NEON DB
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // 1. Auelas geradas recentemente
    const recentLessons = await prisma.lessons.findMany({
      where: { user_id: session.user.id },
      select: {
        id: true,
        title: true,
        subject: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' },
      take: limit
    });

    // 2. Conversas recentes
    const recentConversations = await prisma.conversations.findMany({
      where: { user_id: session.user.id },
      select: {
        id: true,
        module: true,
        subject: true,
        created_at: true,
        token_count: true
      },
      orderBy: { created_at: 'desc' },
      take: Math.ceil(limit / 2)
    });

    // 3. Requisições de IA recentes
    const recentAIRequests = await prisma.ai_requests.findMany({
      where: { 
        user_id: session.user.id,
        success: true
      },
      select: {
        req_id: true,
        provider: true,
        model: true,
        total_tokens: true,
        occurred_at: true,
        metadata: true
      },
      orderBy: { occurred_at: 'desc' },
      take: Math.ceil(limit / 3)
    });

    // 4. Progresso de aulas
    const lessonProgress = await prisma.lesson_progress.findMany({
      where: { user_id: session.user.id },
      select: {
        lesson_id: true,
        current_stage: true,
        is_completed: true,
        updated_at: true,
        lesson: {
          select: {
            title: true,
            subject: true
          }
        }
      },
      orderBy: { updated_at: 'desc' },
      take: Math.ceil(limit / 2)
    });

    // 5. Eventos do sistema relacionados ao usuário
    const recentEvents = await prisma.events.findMany({
      where: { user_id: session.user.id },
      select: {
        event_id: true,
        module: true,
        action: true,
        metadata: true,
        occurred_at: true
      },
      orderBy: { occurred_at: 'desc' },
      take: Math.ceil(limit / 4)
    });

    // Combinar e formatar atividades
    const activities = [
      // Auelas
      ...recentLessons.map(lesson => ({
        id: lesson.id,
        type: 'lesson_generated',
        title: `Aula gerada: ${lesson.title}`,
        description: `Nova aula criada em ${lesson.subject}`,
        timestamp: lesson.created_at,
        metadata: {
          lessonId: lesson.id,
          subject: lesson.subject,
          action: 'create_lesson'
        }
      })),
      
      // Conversas
      ...recentConversations.map(conv => ({
        id: conv.id,
        type: 'conversation',
        title: `Conversa em ${conv.module}`,
        description: `${conv.token_count} tokens usados`,
        timestamp: conv.created_at,
        metadata: {
          conversationId: conv.id,
          module: conv.module,
          tokens: conv.token_count
        }
      })),
      
      // Requisições de IA
      ...recentAIRequests.map(req => ({
        id: req.req_id,
        type: 'ai_request',
        title: `Requisição ${req.provider}/${req.model}`,
        description: `${req.total_tokens} tokens processados`,
        timestamp: req.occurred_at,
        metadata: {
          requestId: req.req_id,
          provider: req.provider,
          model: req.model,
          tokens: req.total_tokens,
          ...req.metadata
        }
      })),
      
      // Progresso de aulas
      ...lessonProgress.map(progress => ({
        id: `${progress.lesson_id}_progress`,
        type: progress.is_completed ? 'lesson_completed' : 'lesson_progress',
        title: progress.is_completed ? 'Aula concluída!' : `Progresso em ${progress.lesson?.title}`,
        description: `Estágio ${progress.current_stage}`,
        timestamp: progress.updated_at,
        metadata: {
          lessonId: progress.lesson_id,
          lessonTitle: progress.lesson?.title,
          currentStage: progress.current_stage,
          completed: progress.is_completed
        }
      })),
      
      // Eventos do sistema
      ...recentEvents.map(event => ({
        id: event.event_id,
        type: 'system_event',
        title: `${event.module}: ${event.action}`,
        description: event.metadata?.description || 'Evento do sistema',
        timestamp: event.occurred_at,
        metadata: {
          eventId: event.event_id,
          module: event.module,
          action: event.action,
          ...event.metadata
        }
      }))
    ];

    // Ordenar por timestamp e limitar
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json(sortedActivities);

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch recent activity' 
    }, { status: 500 });
  }
}
