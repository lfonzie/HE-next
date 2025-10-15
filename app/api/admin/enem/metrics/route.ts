import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

import { requireSuperAdmin, handleSuperAdminRouteError } from '@/lib/admin-auth';
import { EnemObservabilityService } from '@/lib/enem-observability';



export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin(request);

    const body = await request.json();
    const { start, end } = body;

    if (!start || !end) {
      return NextResponse.json({ 
        error: 'Missing required fields: start, end' 
      }, { status: 400 });
    }

    const observabilityService = new EnemObservabilityService();
    const metrics = await observabilityService.getMetrics({
      start: new Date(start),
      end: new Date(end)
    });

    await observabilityService.cleanup();

    return NextResponse.json(metrics);

  } catch (error) {
    const adminResponse = handleSuperAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error fetching ENEM metrics:', error);
    return NextResponse.json({
      error: 'Failed to fetch metrics',
      success: false
    }, { status: 500 });
  }
}
