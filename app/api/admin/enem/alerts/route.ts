import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin, handleSuperAdminRouteError } from '@/lib/admin-auth';
import { EnemObservabilityService } from '@/lib/enem-observability';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);

    const observabilityService = new EnemObservabilityService();
    const alerts = await observabilityService.getPerformanceAlerts();

    await observabilityService.cleanup();

    return NextResponse.json(alerts);

  } catch (error) {
    const adminResponse = handleSuperAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error fetching ENEM alerts:', error);
    return NextResponse.json({
      error: 'Failed to fetch alerts',
      success: false
    }, { status: 500 });
  }
}
