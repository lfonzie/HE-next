import { NextResponse } from 'next/server';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

import { getSchoolsData } from '@/lib/admin-utils';

export async function GET() {
  try {
    const schools = await getSchoolsData();
    return NextResponse.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 });
  }
}