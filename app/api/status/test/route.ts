import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Status API is working',
      timestamp: new Date().toISOString(),
      data: {
        p95: [],
        errorRate: [],
        rps: [],
        systemMetrics: [],
        errorLogs: [],
        systemStatus: {
          total_traces: 0,
          error_rate: 0,
          avg_latency: 0
        },
        topRoutes: []
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch status data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
