import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

import { getUsersData } from '@/lib/admin-utils';
import { withAdminTracing } from '@/lib/admin-telemetry';
import { handleAdminRouteError, requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    return await withAdminTracing('admin.users.get', async () => {
      const users = await getUsersData();
      return NextResponse.json(users);
    }, {
      'admin.endpoint': '/api/admin/users',
      'admin.method': 'GET',
    });
  } catch (error) {
    const adminResponse = handleAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
