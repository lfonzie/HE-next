import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper function to convert BigInt to Number safely
function convertBigIntToNumber(value: any): number {
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return Number(value) || 0;
}

export async function GET() {
  try {
    const since = new Date(Date.now() - 15 * 60 * 1000); // últimos 15 minutos

    // Latência por rota (p95) — assumindo attr.route no span
    const p95 = await prisma.$queryRawUnsafe<any[]>(`
      with spans as (
        select
          (attributes->>'http.route') as route,
          "durationMs"
        from "TraceSpan"
        where "startTime" > $1
          and (attributes ? 'http.route')
          and kind = 'SERVER'
      ),
      ranked as (
        select route, "durationMs",
               percent_rank() over (partition by route order by "durationMs") as pr
        from spans
      )
      select route, max("durationMs") filter (where pr <= 0.95) as p95_ms
      from ranked
      group by route
      order by p95_ms desc nulls last
      limit 20;
    `, since);

    // Erro % por rota
    const errorRate = await prisma.$queryRawUnsafe<any[]>(`
      with base as (
        select (attributes->>'http.route') as route,
               (case when "statusCode" = '2' or "statusCode" = 'OK' then 0 else 1 end) as is_err
        from "TraceSpan"
        where "startTime" > $1 and (attributes ? 'http.route') and kind = 'SERVER'
      )
      select route,
        case when count(*) > 0 then avg(is_err)::float else 0.0 end as error_rate
      from base
      group by route
      order by error_rate desc
      limit 20;
    `, since);

    // RPS total por minuto
    const rps = await prisma.$queryRawUnsafe<any[]>(`
      select 
        date_trunc('minute', "startTime") as minute, 
        count(*)::int as hits
      from "TraceSpan"
      where "startTime" > $1 and kind = 'SERVER'
      group by minute
      order by minute desc
      limit 15;
    `, since);

    // Métricas de sistema
    const systemMetrics = await prisma.$queryRawUnsafe<any[]>(`
      select 
        name,
        avg(value) as avg_value,
        max(value) as max_value,
        min(value) as min_value,
        count(*) as data_points
      from "MetricPoint"
      where time > $1
      group by name
      order by avg_value desc
      limit 10;
    `, since);

    // Logs de erro recentes
    const errorLogs = await prisma.logRecord.findMany({
      where: {
        time: { gte: since },
        severity: { in: ['ERROR', 'FATAL'] }
      },
      orderBy: { time: 'desc' },
      take: 10,
      select: {
        time: true,
        severity: true,
        body: true,
        traceId: true,
        attr: true
      }
    });

    // Status geral do sistema
    const systemStatus = await prisma.$queryRawUnsafe<any[]>(`
      select 
        'total_traces' as metric,
        count(*)::int as value
      from "TraceSpan"
      where "startTime" > $1
      union all
      select 
        'error_rate' as metric,
        case 
          when count(*) > 0 then 
            (count(*) filter (where "statusCode" != 'OK' and "statusCode" != '2'))::float / count(*)::float * 100 
          else 0.0 
        end as value
      from "TraceSpan"
      where "startTime" > $1 and kind = 'SERVER'
      union all
      select 
        'avg_latency' as metric,
        case when count(*) > 0 then avg("durationMs")::float else 0.0 end as value
      from "TraceSpan"
      where "startTime" > $1 and kind = 'SERVER'
    `, since);

    // Top rotas por volume
    const topRoutes = await prisma.$queryRawUnsafe<any[]>(`
      select 
        (attributes->>'http.route') as route,
        count(*)::int as requests,
        avg("durationMs")::float as avg_latency,
        max("durationMs")::int as max_latency
      from "TraceSpan"
      where "startTime" > $1 
        and (attributes ? 'http.route') 
        and kind = 'SERVER'
      group by route
      order by requests desc
      limit 10;
    `, since);

    // Convert all BigInt values to numbers
    const processedSystemStatus = systemStatus.reduce((acc, item) => {
      acc[item.metric] = convertBigIntToNumber(item.value);
      return acc;
    }, {} as Record<string, any>);

    const processedP95 = p95.map(item => ({
      route: item.route,
      p95_ms: convertBigIntToNumber(item.p95_ms)
    }));

    const processedErrorRate = errorRate.map(item => ({
      route: item.route,
      error_rate: convertBigIntToNumber(item.error_rate)
    }));

    const processedRps = rps.map(item => ({
      minute: item.minute,
      hits: convertBigIntToNumber(item.hits)
    }));

    const processedSystemMetrics = systemMetrics.map(item => ({
      name: item.name,
      avg_value: convertBigIntToNumber(item.avg_value),
      max_value: convertBigIntToNumber(item.max_value),
      min_value: convertBigIntToNumber(item.min_value),
      data_points: convertBigIntToNumber(item.data_points)
    }));

    const processedTopRoutes = topRoutes.map(item => ({
      route: item.route,
      requests: convertBigIntToNumber(item.requests),
      avg_latency: convertBigIntToNumber(item.avg_latency),
      max_latency: convertBigIntToNumber(item.max_latency)
    }));

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      period: '15m',
      p95: processedP95,
      errorRate: processedErrorRate,
      rps: processedRps,
      systemMetrics: processedSystemMetrics,
      errorLogs,
      systemStatus: processedSystemStatus,
      topRoutes: processedTopRoutes
    });

  } catch (error) {
    console.error('Status summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}