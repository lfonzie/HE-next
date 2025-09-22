import { NextResponse } from 'next/server';
import { BusinessMetricsCollector } from '@/lib/metrics/business-metrics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const metricsCollector = new BusinessMetricsCollector();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || '24h';
    const since = new Date();
    
    // Calcular período
    switch (period) {
      case '1h':
        since.setHours(since.getHours() - 1);
        break;
      case '24h':
        since.setDate(since.getDate() - 1);
        break;
      case '7d':
        since.setDate(since.getDate() - 7);
        break;
      case '30d':
        since.setDate(since.getDate() - 30);
        break;
      default:
        since.setDate(since.getDate() - 1);
    }

    const metrics = await metricsCollector.getBusinessMetricsSummary(since);

    return NextResponse.json({
      success: true,
      period,
      since: since.toISOString(),
      metrics
    });

  } catch (error) {
    console.error('Error fetching business metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business metrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, value, unit, metadata } = body;

    if (!name || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, value' },
        { status: 400 }
      );
    }

    await metricsCollector.saveBusinessMetric({
      id: `business-${Date.now()}`,
      name,
      value,
      unit: unit || 'count',
      timestamp: new Date(),
      metadata: metadata || {}
    });

    return NextResponse.json({
      success: true,
      message: 'Business metric saved successfully'
    });

  } catch (error) {
    console.error('Error saving business metric:', error);
    return NextResponse.json(
      { error: 'Failed to save business metric', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
