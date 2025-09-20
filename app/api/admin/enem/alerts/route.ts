import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { EnemObservabilityService } from '@/lib/enem-observability';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin role check
    // if (session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const observabilityService = new EnemObservabilityService();
    const alerts = await observabilityService.getPerformanceAlerts();

    await observabilityService.cleanup();

    return NextResponse.json(alerts);

  } catch (error) {
    console.error('Error fetching ENEM alerts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch alerts',
      success: false 
    }, { status: 500 });
  }
}
