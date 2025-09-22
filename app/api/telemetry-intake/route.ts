import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SECRET = process.env.INTAKE_SECRET;

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação se configurada
    if (SECRET && req.headers.get('x-intake-secret') !== SECRET) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const writes: Promise<any>[] = [];

    // ===== TRACES =====
    for (const rs of body.resourceSpans ?? []) {
      const resource = rs.resource ?? {};
      for (const scopeSpans of rs.scopeSpans ?? []) {
        const scope = scopeSpans.scope ?? {};
        for (const span of scopeSpans.spans ?? []) {
          const startNs = Number(span.startTimeUnixNano ?? 0);
          const endNs = Number(span.endTimeUnixNano ?? 0);
          const durationMs = endNs > startNs ? Math.round((endNs - startNs) / 1e6) : 0;

          writes.push(
            prisma.traceSpan.create({
              data: {
                traceId: span.traceId,
                spanId: span.spanId,
                parentSpanId: span.parentSpanId ?? null,
                name: span.name ?? 'unnamed',
                kind: span.kind?.toString() ?? 'INTERNAL',
                startTime: new Date(startNs / 1e6),
                endTime: new Date(endNs / 1e6),
                durationMs,
                statusCode: span.status?.code?.toString() ?? 'UNSET',
                statusMessage: span.status?.message ?? null,
                attributes: toAttrJson(span.attributes ?? []),
                resource,
                scope,
              },
            })
          );
        }
      }
    }

    // ===== METRICS =====
    for (const rm of body.resourceMetrics ?? []) {
      const resource = rm.resource ?? {};
      for (const sm of rm.scopeMetrics ?? []) {
        for (const m of sm.metrics ?? []) {
          const name = m.name ?? 'metric';
          const unit = m.unit ?? null;
          
          // Handle sum/gauge/histogram numéricas simples
          const datapoints =
            m.sum?.dataPoints ??
            m.gauge?.dataPoints ??
            m.summary?.dataPoints ??
            m.histogram?.dataPoints ??
            [];

          for (const dp of datapoints) {
            const time = dp.timeUnixNano ? new Date(Number(dp.timeUnixNano) / 1e6) : new Date();
            const value =
              dp.asDouble ??
              dp.asInt ??
              dp.value ??
              (dp.count && dp.sum ? dp.sum / dp.count : null);

            if (typeof value === 'number') {
              writes.push(
                prisma.metricPoint.create({
                  data: {
                    name,
                    unit,
                    time,
                    value,
                    attr: toAttrJson(dp.attributes ?? []),
                    resource,
                    type: metricTypeOf(m),
                  },
                })
              );
            }
          }
        }
      }
    }

    // ===== LOGS =====
    for (const rl of body.resourceLogs ?? []) {
      const resource = rl.resource ?? {};
      for (const sl of rl.scopeLogs ?? []) {
        for (const log of sl.logRecords ?? []) {
          const time = log.timeUnixNano ? new Date(Number(log.timeUnixNano) / 1e6) : new Date();
          
          writes.push(
            prisma.logRecord.create({
              data: {
                time,
                severity: log.severityText ?? log.severityNumber?.toString() ?? null,
                body: log.body?.stringValue ?? JSON.stringify(log.body) ?? '',
                attr: toAttrJson(log.attributes ?? []),
                resource,
                spanId: log.spanId ?? null,
                traceId: log.traceId ?? null,
              },
            })
          );
        }
      }
    }

    // Executar todas as inserções em transação
    if (writes.length > 0) {
      await prisma.$transaction(writes, { timeout: 30000 });
    }

    return NextResponse.json({ 
      ok: true, 
      inserted: writes.length,
      traces: body.resourceSpans?.length ?? 0,
      metrics: body.resourceMetrics?.length ?? 0,
      logs: body.resourceLogs?.length ?? 0
    });

  } catch (error) {
    console.error('Telemetry intake error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function toAttrJson(attrs: any[]): Record<string, any> {
  const out: Record<string, any> = {};
  for (const a of attrs) {
    if (!a || typeof a.key !== 'string') continue;
    out[a.key] = a.value?.stringValue ?? a.value?.intValue ?? a.value?.doubleValue ?? a.value?.boolValue ?? a.value ?? null;
  }
  return out;
}

function metricTypeOf(m: any): string {
  if (m.sum) return 'COUNTER';
  if (m.gauge) return 'GAUGE';
  if (m.histogram) return 'HISTOGRAM';
  if (m.summary) return 'SUMMARY';
  return 'UNKNOWN';
}
