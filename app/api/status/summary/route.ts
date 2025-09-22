import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
      where "startTime" > $1 and kind='SERVER'
      group by 1
      order by 1 asc;
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
        severity: { in: ['ERROR', 'FATAL', 'error', 'fatal'] }
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

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      period: '15m',
      p95,
      errorRate,
      rps,
      systemMetrics,
      errorLogs,
      systemStatus: systemStatus.reduce((acc, item) => {
        acc[item.metric] = item.value;
        return acc;
      }, {} as Record<string, any>),
      topRoutes
    });

  } catch (error) {
    console.error('Status summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
