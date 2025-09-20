import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { auth } from '@/lib/auth';


import { EnemPrivacyService } from '@/lib/enem-privacy';



export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const privacyService = new EnemPrivacyService();
    
    // Check if user can export data
    const canExport = await privacyService.canExportUserData(session.user.id);
    if (!canExport) {
      return NextResponse.json({ 
        error: 'Data export not allowed for this user',
        success: false 
      }, { status: 403 });
    }

    const userData = await privacyService.exportUserData(session.user.id);
    await privacyService.cleanup();

    return NextResponse.json(userData);

  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json({ 
      error: 'Failed to export user data',
      success: false 
    }, { status: 500 });
  }
}
