import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { getModelsData } from '@/lib/admin-utils';
import { handleAdminRouteError, requireAdmin } from '@/lib/admin-auth';



export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const models = await getModelsData();
    return NextResponse.json(models);
  } catch (error) {
    const adminResponse = handleAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error fetching models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}
