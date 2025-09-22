import { NextResponse } from 'next/server';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

import { getUsersData } from '@/lib/admin-utils';
import { withAdminTracing } from '@/lib/admin-telemetry';

export async function GET() {
  return withAdminTracing('admin.users.get', async () => {
    const users = await getUsersData();
    return NextResponse.json(users);
  }, {
    'admin.endpoint': '/api/admin/users',
    'admin.method': 'GET',
  });
}
