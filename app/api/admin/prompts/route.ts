import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { getPromptsData } from '@/lib/admin-utils';
import { handleAdminRouteError, requireAdmin } from '@/lib/admin-auth';



export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const prompts = await getPromptsData();
    return NextResponse.json(prompts);
  } catch (error) {
    const adminResponse = handleAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error fetching prompts:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}
