import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { EnemObservabilityService } from '@/lib/enem-observability';

export async function POST(request: NextRequest) {
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
    console.error('Error fetching ENEM metrics:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch metrics',
      success: false 
    }, { status: 500 });
  }
}
