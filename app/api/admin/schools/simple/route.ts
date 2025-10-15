import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

import { withAdminTracing } from '@/lib/admin-telemetry';
import { handleSuperAdminRouteError, requireSuperAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);

    return await withAdminTracing('admin.schools.simple.get', async () => {
      const schools = await prisma.schools.findMany({
        select: {
          id: true,
          name: true,
          email: true
        },
        orderBy: {
          name: 'asc'
        }
      });

      return NextResponse.json(schools);
    }, {
      'admin.endpoint': '/api/admin/schools/simple',
      'admin.method': 'GET',
    });
  } catch (error) {
    const adminResponse = handleSuperAdminRouteError(error);
    if (adminResponse) {
      return adminResponse;
    }

    console.error('Error fetching schools:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
