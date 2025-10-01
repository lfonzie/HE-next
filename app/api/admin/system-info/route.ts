import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { getSystemInfo } from '@/lib/admin-utils';
import { handleAdminRouteError, requireAdmin } from '@/lib/admin-auth';



export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const systemInfo = await getSystemInfo();
    return NextResponse.json(systemInfo);
  } catch (error) {
    const adminResponse = handleAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error fetching system info:', error);
    return NextResponse.json({ error: 'Failed to fetch system info' }, { status: 500 });
  }
}
