// api/telemetry/route.ts - API para telemetria do laboratório virtual
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface TelemetryData {
  userId?: string;
  sessionId: string;
  experimentId: string;
  timestamp: number;
  event: string;
  data: Record<string, any>;
  metadata?: {
    userAgent?: string;
    screenResolution?: string;
    timezone?: string;
  };
}

// Simulação de armazenamento de telemetria (em produção seria um banco de dados)
const telemetryData: TelemetryData[] = [];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Telemetria pode ser anônima, mas preferimos ter sessão quando possível
    const userId = session?.user?.id;
    
    const body = await request.json();
    const { sessionId, experimentId, event, data, metadata } = body;

    if (!sessionId || !experimentId || !event) {
      return NextResponse.json({ 
        error: 'Missing required fields: sessionId, experimentId, event' 
      }, { status: 400 });
    }

    // Validar tipos de eventos permitidos
    const allowedEvents = [
      'experiment_start',
      'experiment_pause',
      'experiment_stop',
      'experiment_reset',
      'item_added',
      'item_removed',
      'item_moved',
      'measurement_taken',
      'objective_completed',
      'objective_failed',
      'preset_loaded',
      'scenario_saved',
      'scenario_loaded',
      'error_occurred'
    ];

    if (!allowedEvents.includes(event)) {
      return NextResponse.json({ 
        error: `Invalid event type: ${event}` 
      }, { status: 400 });
    }

    // Criar entrada de telemetria
    const telemetryEntry: TelemetryData = {
      userId,
      sessionId,
      experimentId,
      timestamp: Date.now(),
      event,
      data: {
        ...data,
        // Adicionar informações de contexto
        timestamp: Date.now(),
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
      },
      metadata: {
        ...metadata,
        userAgent: request.headers.get('user-agent') || undefined,
        screenResolution: data.screenResolution,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    // Armazenar telemetria
    telemetryData.push(telemetryEntry);

    // Log para desenvolvimento
    console.log(`📊 [VIRTUAL-LAB] Telemetry: ${event}`, {
      sessionId,
      experimentId,
      userId: userId ? 'authenticated' : 'anonymous',
      dataSize: JSON.stringify(data).length
    });

    return NextResponse.json({
      success: true,
      message: 'Telemetry data recorded',
      timestamp: telemetryEntry.timestamp
    });

  } catch (error: any) {
    console.error('❌ [VIRTUAL-LAB] Error recording telemetry:', error);
    return NextResponse.json({
      error: 'Failed to record telemetry',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const experimentId = searchParams.get('experimentId');
    const eventType = searchParams.get('event');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Filtrar dados de telemetria
    let filteredData = telemetryData;

    if (experimentId) {
      filteredData = filteredData.filter(d => d.experimentId === experimentId);
    }

    if (eventType) {
      filteredData = filteredData.filter(d => d.event === eventType);
    }

    if (startTime) {
      const start = parseInt(startTime);
      filteredData = filteredData.filter(d => d.timestamp >= start);
    }

    if (endTime) {
      const end = parseInt(endTime);
      filteredData = filteredData.filter(d => d.timestamp <= end);
    }

    // Limitar resultados
    filteredData = filteredData.slice(-limit);

    // Agregar estatísticas
    const stats = {
      totalEvents: filteredData.length,
      uniqueSessions: new Set(filteredData.map(d => d.sessionId)).size,
      uniqueUsers: new Set(filteredData.map(d => d.userId).filter(Boolean)).size,
      eventTypes: filteredData.reduce((acc, d) => {
        acc[d.event] = (acc[d.event] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      experiments: new Set(filteredData.map(d => d.experimentId)).size
    };

    return NextResponse.json({
      success: true,
      data: filteredData,
      stats,
      count: filteredData.length
    });

  } catch (error: any) {
    console.error('❌ [VIRTUAL-LAB] Error fetching telemetry:', error);
    return NextResponse.json({
      error: 'Failed to fetch telemetry',
      details: error.message
    }, { status: 500 });
  }
}

// Endpoint para analytics agregados
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { experimentId, timeRange } = body;

    // Calcular analytics agregados
    const relevantData = telemetryData.filter(d => 
      d.experimentId === experimentId &&
      d.timestamp >= (Date.now() - (timeRange || 24 * 60 * 60 * 1000)) // Últimas 24h por padrão
    );

    const analytics = {
      experimentId,
      timeRange,
      totalSessions: new Set(relevantData.map(d => d.sessionId)).size,
      totalUsers: new Set(relevantData.map(d => d.userId).filter(Boolean)).size,
      averageSessionDuration: calculateAverageSessionDuration(relevantData),
      completionRate: calculateCompletionRate(relevantData),
      mostCommonEvents: getMostCommonEvents(relevantData),
      errorRate: calculateErrorRate(relevantData),
      userEngagement: calculateUserEngagement(relevantData)
    };

    return NextResponse.json({
      success: true,
      analytics
    });

  } catch (error: any) {
    console.error('❌ [VIRTUAL-LAB] Error calculating analytics:', error);
    return NextResponse.json({
      error: 'Failed to calculate analytics',
      details: error.message
    }, { status: 500 });
  }
}

// Funções auxiliares para analytics
function calculateAverageSessionDuration(data: TelemetryData[]): number {
  const sessions = new Map<string, { start: number; end: number }>();
  
  data.forEach(d => {
    if (!sessions.has(d.sessionId)) {
      sessions.set(d.sessionId, { start: d.timestamp, end: d.timestamp });
    } else {
      const session = sessions.get(d.sessionId)!;
      session.start = Math.min(session.start, d.timestamp);
      session.end = Math.max(session.end, d.timestamp);
    }
  });

  const durations = Array.from(sessions.values()).map(s => s.end - s.start);
  return durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
}

function calculateCompletionRate(data: TelemetryData[]): number {
  const completedSessions = new Set(
    data.filter(d => d.event === 'objective_completed').map(d => d.sessionId)
  );
  const totalSessions = new Set(data.map(d => d.sessionId)).size;
  
  return totalSessions > 0 ? completedSessions.size / totalSessions : 0;
}

function getMostCommonEvents(data: TelemetryData[]): Array<{ event: string; count: number }> {
  const eventCounts = data.reduce((acc, d) => {
    acc[d.event] = (acc[d.event] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(eventCounts)
    .map(([event, count]) => ({ event, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function calculateErrorRate(data: TelemetryData[]): number {
  const errorEvents = data.filter(d => d.event === 'error_occurred').length;
  const totalEvents = data.length;
  
  return totalEvents > 0 ? errorEvents / totalEvents : 0;
}

function calculateUserEngagement(data: TelemetryData[]): number {
  // Métrica simplificada: média de eventos por sessão
  const sessionEventCounts = data.reduce((acc, d) => {
    acc[d.sessionId] = (acc[d.sessionId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const eventCounts = Object.values(sessionEventCounts);
  return eventCounts.reduce((sum, count) => sum + count, 0) / eventCounts.length;
}
