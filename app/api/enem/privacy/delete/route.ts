import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { auth } from '@/lib/auth';


import { EnemPrivacyService } from '@/lib/enem-privacy';



export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json({ 
        error: 'Reason is required for data deletion request' 
      }, { status: 400 });
    }

    const privacyService = new EnemPrivacyService();
    const requestId = await privacyService.requestDataDeletion(session.user.id, reason);
    await privacyService.cleanup();

    return NextResponse.json({ 
      requestId,
      message: 'Data deletion request submitted successfully. It will be processed within 30 days.',
      success: true 
    });

  } catch (error) {
    console.error('Error requesting data deletion:', error);
    return NextResponse.json({ 
      error: 'Failed to request data deletion',
      success: false 
    }, { status: 500 });
  }
}
