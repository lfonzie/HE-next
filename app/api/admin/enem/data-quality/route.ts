import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

import { requireSuperAdmin, handleSuperAdminRouteError } from '@/lib/admin-auth';
import { EnemObservabilityService } from '@/lib/enem-observability';



export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);

    const observabilityService = new EnemObservabilityService();
    const dataQuality = await observabilityService.getDataQualityReport();

    await observabilityService.cleanup();

    return NextResponse.json(dataQuality);

  } catch (error) {
    const adminResponse = handleSuperAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error fetching ENEM data quality report:', error);
    return NextResponse.json({
      error: 'Failed to fetch data quality report',
      success: false
    }, { status: 500 });
  }
}
