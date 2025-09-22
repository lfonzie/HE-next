import { NextResponse } from 'next/server';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

import { getSchoolsData } from '@/lib/admin-utils';
import { withAdminTracing } from '@/lib/admin-telemetry';

export async function GET() {
  return withAdminTracing('admin.schools.get', async () => {
    const schools = await getSchoolsData();
    return NextResponse.json(schools);
  }, {
    'admin.endpoint': '/api/admin/schools',
    'admin.method': 'GET',
  });
}