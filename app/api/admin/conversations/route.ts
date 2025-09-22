import { NextResponse } from 'next/server';

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

import { getConversationsData } from '@/lib/admin-utils';
import { withAdminTracing } from '@/lib/admin-telemetry';

export async function GET() {
  return withAdminTracing('admin.conversations.get', async () => {
    const conversations = await getConversationsData();
    return NextResponse.json(conversations);
  }, {
    'admin.endpoint': '/api/admin/conversations',
    'admin.method': 'GET',
  });
}
